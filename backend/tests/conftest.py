import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.dependencies import get_session
from app.core.limiter import limiter

DATABASE_URL = "sqlite://"

@pytest.fixture(autouse=True)
def reset_rate_limiter():
    # The limiter's in-memory storage is a module-level global that
    # persists for the life of the test process, unlike the DB (fresh
    # per test via the engine/session fixtures). Without resetting it,
    # tests that register/login enough times trip the real /auth rate
    # limits and later tests fail with an unrelated 429.
    limiter.reset()
    yield
    limiter.reset()

@pytest.fixture
def engine():
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session

@pytest_asyncio.fixture
async def client(session):
    def get_session_override():
        yield session
    app.dependency_overrides[get_session] = get_session_override
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def auth_headers(client):
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def auth_headers_b(client):
    await client.post("/auth/register", json={
        "username": "testuserb",
        "email": "testb@example.com",
        "password": "password123"
    })
    response = await client.post("/auth/login", json={
        "email": "testb@example.com",
        "password": "password123"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}