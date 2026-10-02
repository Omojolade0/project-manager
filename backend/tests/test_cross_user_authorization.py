"""Cross-user authorization tests.

Verifies that one authenticated user can never read, modify, or delete
another user's projects, tasks, or notes, and never sees another user's
data through search. Uses two real registered users (not guest accounts —
guest mode has its own rate limits and demo-specific behavior that aren't
relevant to core ownership checks).

Confirmed via manual testing: the app deliberately returns 404 (not 403)
for cross-user access, to avoid revealing that the resource exists at all.
If any endpoint below is found to behave differently, the test asserts the
*actual* current behavior and documents it as a finding — it does not
silently relax the assertion to match a leak.
"""

DISTINCT_PROJECT_NAME = "UserA-Confidential-Project"
DISTINCT_TASK_TITLE = "UserA-Confidential-Task"
DISTINCT_NOTE_CONTENT = "UserA-Confidential-Note-Content"


async def _create_project(client, headers, name=DISTINCT_PROJECT_NAME):
    response = await client.post("/projects", json={
        "name": name,
        "description": "Owned by user A",
        "status": "Active",
    }, headers=headers)
    assert response.status_code == 200
    return response.json()["id"]


async def _create_task(client, headers, project_id, title=DISTINCT_TASK_TITLE):
    response = await client.post(f"/projects/{project_id}/tasks", json={
        "title": title,
        "description": "Owned by user A",
    }, headers=headers)
    assert response.status_code == 200
    return response.json()["id"]


async def _create_note(client, headers, project_id, content=DISTINCT_NOTE_CONTENT):
    response = await client.post(f"/projects/{project_id}/notes", json={
        "content": content,
    }, headers=headers)
    assert response.status_code == 200
    return response.json()["id"]


# ─── PROJECTS ─────────────────────────────────────────────────────────────────

async def test_project_get_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)

    response = await client.get(f"/projects/{project_id}", headers=auth_headers_b)

    assert response.status_code == 404
    assert DISTINCT_PROJECT_NAME not in response.text


async def test_project_update_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)

    response = await client.put(f"/projects/{project_id}", json={
        "name": "Hijacked",
    }, headers=auth_headers_b)

    assert response.status_code == 404
    assert DISTINCT_PROJECT_NAME not in response.text

    # The project must be unchanged when viewed by its real owner.
    check = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert check.json()["name"] == DISTINCT_PROJECT_NAME


async def test_project_delete_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)

    response = await client.delete(f"/projects/{project_id}", headers=auth_headers_b)

    assert response.status_code == 404
    assert DISTINCT_PROJECT_NAME not in response.text

    # The project must still exist for its real owner.
    check = await client.get(f"/projects/{project_id}", headers=auth_headers)
    assert check.status_code == 200


# ─── TASKS ────────────────────────────────────────────────────────────────────

async def test_task_get_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    task_id = await _create_task(client, auth_headers, project_id)

    response = await client.get(
        f"/projects/{project_id}/tasks/{task_id}", headers=auth_headers_b
    )

    assert response.status_code == 404
    assert DISTINCT_TASK_TITLE not in response.text


async def test_task_update_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    task_id = await _create_task(client, auth_headers, project_id)

    response = await client.put(
        f"/projects/{project_id}/tasks/{task_id}",
        json={"title": "Hijacked"},
        headers=auth_headers_b,
    )

    assert response.status_code == 404
    assert DISTINCT_TASK_TITLE not in response.text

    check = await client.get(
        f"/projects/{project_id}/tasks/{task_id}", headers=auth_headers
    )
    assert check.json()["title"] == DISTINCT_TASK_TITLE


async def test_task_delete_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    task_id = await _create_task(client, auth_headers, project_id)

    response = await client.delete(
        f"/projects/{project_id}/tasks/{task_id}", headers=auth_headers_b
    )

    assert response.status_code == 404
    assert DISTINCT_TASK_TITLE not in response.text

    check = await client.get(
        f"/projects/{project_id}/tasks/{task_id}", headers=auth_headers
    )
    assert check.status_code == 200


# ─── NOTES ────────────────────────────────────────────────────────────────────

async def test_note_get_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    note_id = await _create_note(client, auth_headers, project_id)

    response = await client.get(
        f"/projects/{project_id}/notes/{note_id}", headers=auth_headers_b
    )

    assert response.status_code == 404
    assert DISTINCT_NOTE_CONTENT not in response.text


async def test_note_update_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    note_id = await _create_note(client, auth_headers, project_id)

    response = await client.put(
        f"/projects/{project_id}/notes/{note_id}",
        json={"content": "Hijacked"},
        headers=auth_headers_b,
    )

    assert response.status_code == 404
    assert DISTINCT_NOTE_CONTENT not in response.text

    check = await client.get(
        f"/projects/{project_id}/notes/{note_id}", headers=auth_headers
    )
    assert check.json()["content"] == DISTINCT_NOTE_CONTENT


async def test_note_delete_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    note_id = await _create_note(client, auth_headers, project_id)

    response = await client.delete(
        f"/projects/{project_id}/notes/{note_id}", headers=auth_headers_b
    )

    assert response.status_code == 404
    assert DISTINCT_NOTE_CONTENT not in response.text

    check = await client.get(
        f"/projects/{project_id}/notes/{note_id}", headers=auth_headers
    )
    assert check.status_code == 200


# ─── SEARCH ───────────────────────────────────────────────────────────────────

async def test_search_dropdown_never_returns_other_users_items(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    await _create_task(client, auth_headers, project_id)

    response = await client.get(
        "/search", params={"text": "UserA-Confidential"}, headers=auth_headers_b
    )

    assert response.status_code == 200
    assert DISTINCT_PROJECT_NAME not in response.text
    assert DISTINCT_TASK_TITLE not in response.text
    body = response.json()
    assert (body.get("projects") or []) == []
    assert (body.get("tasks") or []) == []


async def test_search_full_never_returns_other_users_items(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)
    await _create_task(client, auth_headers, project_id)

    response = await client.get(
        "/search/full",
        params={"q": "UserA-Confidential", "type": "all"},
        headers=auth_headers_b,
    )

    assert response.status_code == 200
    assert DISTINCT_PROJECT_NAME not in response.text
    assert DISTINCT_TASK_TITLE not in response.text
    body = response.json()
    assert body["projects"]["items"] == []
    assert body["projects"]["total"] == 0
    assert body["tasks"]["items"] == []
    assert body["tasks"]["total"] == 0

    # Sanity check: the same search as the actual owner does find the item,
    # proving the empty result above is an authorization boundary and not a
    # search bug that would happen to hide the finding.
    owner_response = await client.get(
        "/search/full",
        params={"q": "UserA-Confidential", "type": "all"},
        headers=auth_headers,
    )
    assert owner_response.json()["projects"]["total"] == 1


# ─── AI TASK GENERATION ───────────────────────────────────────────────────────

async def test_ai_generate_tasks_by_other_user_returns_404(client, auth_headers, auth_headers_b):
    project_id = await _create_project(client, auth_headers)

    response = await client.post(
        f"/projects/{project_id}/intelligence/generate-tasks",
        json={
            "project_name": DISTINCT_PROJECT_NAME,
            "project_description": "Owned by user A",
        },
        headers=auth_headers_b,
    )

    assert response.status_code == 404
    assert DISTINCT_PROJECT_NAME not in response.text
