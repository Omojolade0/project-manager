import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlmodel import Session

from app.core import security as util
from app.models.notes import Note
from app.models.project import Project, ProjectStatus
from app.models.task import Priority, Task, TaskStatus
from app.models.user import User

GUEST_ACCOUNT_MAX_AGE = timedelta(hours=24)


def cleanup_expired_guest_users(session: Session) -> None:
  cutoff = datetime.now(timezone.utc) - GUEST_ACCOUNT_MAX_AGE
  session.exec(
      delete(User).where(User.is_guest == True).where(User.created_at < cutoff)
  )
  session.commit()


def _seed_demo_data(user: User, session: Session) -> None:
  now = datetime.now(timezone.utc)

  projects = [
      {
          "name": "Website Redesign",
          "description": "Refresh the marketing site with a lighter visual style ahead of the Q4 launch.",
          "status": ProjectStatus.Active,
          "note": "Client wants a lighter color palette and a larger hero section. Launch target is end of quarter.",
          "tasks": [
              ("Wireframe homepage", TaskStatus.Done, Priority.Medium, now - timedelta(days=5)),
              ("Design system audit", TaskStatus.Inprogress, Priority.High, now + timedelta(days=2)),
              ("Migrate to new CMS", TaskStatus.Todo, Priority.High, now - timedelta(days=2)),
              ("Cross-browser testing", TaskStatus.Todo, Priority.Low, now + timedelta(days=10)),
          ],
      },
      {
          "name": "Q3 Marketing Plan",
          "description": "Plan and launch the Q3 acquisition campaign across email and paid social.",
          "status": ProjectStatus.Active,
          "note": "Focus channels: email and paid social. Budget approval is pending from finance.",
          "tasks": [
              ("Draft campaign brief", TaskStatus.Done, Priority.Medium, now - timedelta(days=10)),
              ("Finalize budget allocation", TaskStatus.Inprogress, Priority.High, now + timedelta(days=1)),
              ("Schedule social content calendar", TaskStatus.Todo, Priority.Medium, now - timedelta(days=1)),
          ],
      },
      {
          "name": "API Integration",
          "description": "Ship the partner API integration for order syncing.",
          "status": ProjectStatus.Completed,
          "note": "Shipped v1 of the partner API integration. Retro is scheduled for next sprint.",
          "tasks": [
              ("Define API contract", TaskStatus.Done, Priority.Medium, now - timedelta(days=20)),
              ("Implement auth flow", TaskStatus.Done, Priority.High, now - timedelta(days=15)),
              ("Write integration tests", TaskStatus.Done, Priority.Low, now - timedelta(days=12)),
          ],
      },
  ]

  for p in projects:
    project = Project(
        name=p["name"],
        description=p["description"],
        status=p["status"],
        user_id=user.id,
    )
    session.add(project)
    session.flush()  # assigns project.id without a full commit

    for title, status, priority, due_date in p["tasks"]:
      session.add(Task(
          project_id=project.id,
          title=title,
          status=status,
          priority=priority,
          due_date=due_date,
      ))

    session.add(Note(project_id=project.id, content=p["note"]))

  session.commit()


def create_guest_user(session: Session) -> User:
  random_password = secrets.token_urlsafe(24)
  guest = User(
      username="Guest",
      email=f"guest-{uuid.uuid4().hex[:8]}@coeus.demo",
      hashed_password=util.hash_password(random_password),
      is_guest=True,
      has_completed_onboarding=True,
  )
  session.add(guest)
  session.commit()
  session.refresh(guest)

  _seed_demo_data(guest, session)

  return guest
