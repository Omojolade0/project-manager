from fastapi import FastAPI
from app.database import create_db_tables
from app.api import project, task, notes, auth, intelligence 
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import FRONTEND_URL


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "https://project-manager-psi-eight.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project.router)
app.include_router(task.router)
app.include_router(notes.router)
app.include_router(auth.auth_router)
app.include_router(intelligence.router)



@app.get("/")
def root():
    """Root endpoint to confirm the API is running."""
    return {"message": "API is running!"}