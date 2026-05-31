

def generate_tasks_prompt(project_name: str, project_description: str) -> str:
    return (
        'you are a project management assistant.\n'
        f'Project: ({project_name})\n'
        f'Description: {project_description}\n'
        'Generate a list of 5-8 tasks for this project. Each task should have a title and description.\n'
        'Return ONLY a JSON array of tasks, with each task having a title and description. Do not include any other text or formatting.\n'
    )