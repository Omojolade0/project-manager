import pytest


# ─── AUTH TESTS ───────────────────────────────────────────────────────────────

async def test_register_success(client):
    response = await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    assert "hashed_password" not in response.json()


async def test_register_duplicate_email(client):
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = await client.post("/auth/register", json={
        "username": "testuser2",
        "email": "test@example.com",
        "password": "password456"
    })
    assert response.status_code == 400


async def test_login_success(client):
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


async def test_login_wrong_password(client): 
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    response = await client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


async def test_login_wrong_email(client):
    response = await client.post("/auth/login", json={
        "email": "nobody@example.com",
        "password": "password123"
    })
    assert response.status_code == 401


# ─── PROJECT TESTS ────────────────────────────────────────────────────────────

async def test_projects_unauthorized(client):
    response = await client.get("/projects")
    assert response.status_code == 401


async def test_create_project(client, auth_headers):
    response = await client.post("/projects", json={
        "name": "Test Project",
        "description": "A test project",
        "status": "Active"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Project"


async def test_get_projects(client, auth_headers):
    response = await client.get("/projects", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_project_by_id(client, auth_headers):
    create = await client.post("/projects", json={
        "name": "Test Project",
        "description": "A test project",
        "status": "Active"
    }, headers=auth_headers)
    project_id = create.json()["id"]

    response = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == project_id


async def test_delete_project(client, auth_headers):
    create = await client.post("/projects", json={
        "name": "Test Project",
        "description": "A test project",
        "status": "Active"
    }, headers=auth_headers)
    project_id = create.json()["id"]

    delete = await client.delete(f"/projects/{project_id}", headers=auth_headers)
    assert delete.status_code == 200

    response = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert response.status_code == 404