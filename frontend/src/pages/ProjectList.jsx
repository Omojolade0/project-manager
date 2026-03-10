import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import projectService from "@/services/projectService";
import { useEffect, useState } from "react";
import ProjectModal from "@/components/ProjectModal";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  async function fetchProjects() {
    try {
      const response = await projectService.getProjects();
      setProjects(response); // also see point 3
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <Layout>
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">All Projects</h2>
        <ProjectModal onSuccess={fetchProjects} />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground mt-4">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">
          No projects yet. Create one!
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={fetchProjects}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
export default ProjectList;
