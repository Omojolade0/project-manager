# Project Manager API

A FastAPI-based project management system with user authentication.

## Features

- User registration and authentication (JWT tokens)
- Project management (CRUD operations)
- Task management within projects
- User isolation (users only see their own data)

## Tech Stack

- **Backend:** FastAPI
- **Database:** SQLite (SQLModel ORM)
- **Authentication:** JWT with bcrypt password hashing

## Setup

### Prerequisites

- Python 3.12+
- pip

### Installation

1. Clone the repository
```bash
git clone 
cd project_backend
```

2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your SECRET_KEY
```

5. Run the server
```bash
uvicorn app.main:app --reload
```

6. Access API documentation
```
http://127.0.0.1:8000/docs
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Projects (Protected)
- `GET /projects` - Get all user's projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get specific project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Tasks (Protected)
- Similar CRUD endpoints for tasks within projects

## Environment Variables

See `.env.example` for required variables.

## Project Structure
```
project_backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── models/              # SQLModel database models
│   ├── crud/                # Database operations
│   ├── routers/             # API endpoints
│   └── auth/                # Authentication logic
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## License

MIT

