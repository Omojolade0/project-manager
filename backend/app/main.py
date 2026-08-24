import asyncio
import contextlib
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
# from app.database import create_db_tables
from app.api import project, task, notes, auth, intelligence, search
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import Session
from app.core.config import FRONTEND_URL
from app.core.limiter import limiter
from app.database import engine
from app.services import demo as demo_service
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)
GUEST_CLEANUP_INTERVAL_SECONDS = 60 * 60  # hourly; guest accounts expire after 24h


def _run_guest_cleanup() -> None:
    with Session(engine) as session:
        demo_service.cleanup_expired_guest_users(session)


async def _guest_cleanup_loop() -> None:
    while True:
        try:
            await asyncio.to_thread(_run_guest_cleanup)
        except Exception:
            logger.exception("Guest account cleanup failed")
        await asyncio.sleep(GUEST_CLEANUP_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(_guest_cleanup_loop())
    yield
    cleanup_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await cleanup_task

app = FastAPI(lifespan=lifespan)

app.state.limiter = limiter


def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many attempts. Please try again later, or contact support@coeus.app if you need help."
        },
    )


app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://project-manager-psi-eight.vercel.app",
        "https://ceous.jolaogunleye.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project.router)
app.include_router(task.router)
app.include_router(task.all_tasks_router)
app.include_router(notes.router)
app.include_router(auth.auth_router)
app.include_router(intelligence.router)
app.include_router(search.router)



@app.get("/")
def root():
    """Root endpoint to confirm the API is running."""
    return {"message": "API is running!"}