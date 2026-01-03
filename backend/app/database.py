from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./orm.db")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_tables():
    return SQLModel.metadata.create_all(engine)