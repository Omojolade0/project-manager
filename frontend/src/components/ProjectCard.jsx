import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/projectService";

function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();

  function handleNavigate() {
    navigate(`/projects/${project.id}`);
  }

  async function handleDelete() {
    try {
      await projectService.deleteProject(project.id);
      onDelete();
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  return (
    <Card
      className="w-[350px] rounded-xl border shadow-sm"
      onClick={handleNavigate}
    >
      <CardHeader className="pb-2 mb-2">
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <CardDescription className="mt-1">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status + Date row */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="rounded-md">
            {project.status}
          </Badge>
          {/* <Badge variant="secondary" className="rounded-md">
            {project.priority}
          </Badge> */}

          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{project.dueDate}</span>
          </div> */}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        {/* “Assignee” icon chip */}
        {/* <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border bg-slate-100 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-xs text-muted-foreground">Assigned</span>
        </div> */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center">
            <Pencil
              className="h-4 w-4 text-slate-600"
              onClick={handleNavigate}
            />
          </div>
        </div>
      </CardFooter>
      {/* would make this positionable */}
      <div className="h-7 w-7 rounded-full flex items-center justify-center">
        <X
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        />
      </div>
    </Card>
  );
}

export default ProjectCard;
