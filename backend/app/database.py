from sqlmodel import SQLModel, create_engine, Session
from app.core.config import DATABASE_URL, ENVIRONMENT



engine = create_engine(
    DATABASE_URL, echo=(ENVIRONMENT == "development")
)
def create_db_tables():
    return SQLModel.metadata.create_all(engine)