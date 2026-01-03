from fastapi import FastAPI, HTTPException
from app.database import create_db_tables
from app.routers import project, task, notes, auth
app = FastAPI()

app.include_router(project.router)
app.include_router(task.router)
app.include_router(notes.router)
app.include_router(auth.auth_router)


@app.on_event("startup")
def on_startup():
    create_db_tables()

@app.get("/")
def root():
    """Root endpoint to confirm the API is running."""
    return {"message": "API is running!"}