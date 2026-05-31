from sqlmodel import Session
from app.core.permissions import verify_project_ownership 
import json
from app.schemas.intelligence import GenerateTaskRequest, GenerateTaskResponse, TaskSuggestion
import logging
from app.helpers.prompts import generate_tasks_prompt
from app.core.config import OPENAI_CLIENT


client = OPENAI_CLIENT
logger = logging.getLogger(__name__)


def get_ai_generated_tasks(project_id: int, data: GenerateTaskRequest, user_id: int, session: Session) -> GenerateTaskResponse:
    verify_project_ownership(project_id, user_id, session)

    prompt = generate_tasks_prompt(data.project_name, data.project_description)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for project management. Return only JSON data."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        raw = json.loads(response.choices[0].message.content)
        task_list = raw.get("tasks", raw) if isinstance(raw, dict) else raw
        return GenerateTaskResponse(tasks=[TaskSuggestion(**t) for t in task_list])

    except Exception as e:
   
        logger.error(f"Error generating tasks: {e}")
        return GenerateTaskResponse(tasks=[])