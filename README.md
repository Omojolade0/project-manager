# Coeus — Project Management App

A full-stack project management application with user authentication, task tracking, and AI-powered features.

**Live Demo:** [project-manager-psi-eight.vercel.app](https://project-manager-psi-eight.vercel.app)

---

## Project Structure

```
project-manager/
├── backend/        # FastAPI backend
├── frontend/       # React frontend
└── .github/
    └── workflows/  # GitHub Actions CI/CD
```

---

## Features

- **Authentication** — JWT-based register and login with bcrypt password hashing
- **Projects** — Create, read, update and delete projects with status tracking
- **Tasks** — Full CRUD with status management (Todo, In Progress, Done)
- **Notes** — Attach notes directly to projects
- **Search** — Search projects by name
- **Error handling** — Toast notifications, form validation and loading states
- **CI/CD** — GitHub Actions runs pytest on every pull request
- **Protected routes** — Auth required for all app pages

---

## Tech Stack

**Backend:**
- FastAPI
- SQLModel (SQLAlchemy ORM)
- PostgreSQL (Railway)
- JWT authentication with bcrypt
- pytest + httpx for testing

**Frontend:**
- React + Vite
- Tailwind CSS
- shadcn/ui
- react-hot-toast
- Axios

**DevOps:**
- Railway (backend hosting)
- Vercel (frontend hosting)
- GitHub Actions (CI/CD pipeline)

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=your_postgresql_url
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
```

Run the server:
```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Run the dev server:
```bash
npm run dev
```

---

## Running Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

10 tests covering auth (register, login, error cases) and project CRUD.

---


## Deployment

- Backend deployed on **Railway** with PostgreSQL
- Frontend deployed on **Vercel**
- CI/CD via **GitHub Actions** — tests run automatically on every PR to main

---
