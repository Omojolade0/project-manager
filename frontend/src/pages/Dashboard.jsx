import Layout from "@/components/Layout";
import StatsIcon from "@/components/StatsIcon";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import TaskListCard from "@/components/TaskListCard";
import ProjectModal from "@/components/ProjectModal";
import projectService from "@/services/projectService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  function handleViewMore() {
    navigate("/projects");
  }
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-2">
        <StatsIcon title="Active Projects" number={projects.length}></StatsIcon>
        <StatsIcon title="Task Due Soon" number={0}></StatsIcon>
        <StatsIcon
          title="Active Projects"
          number={projects.filter((p) => p.status === "Completed").length}
        ></StatsIcon>
      </div>
      <div className="mt-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">My Projects</h2>
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
            {projects.slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={fetchProjects}
              />
            ))}
          </div>
        )}
        <button onClick={handleViewMore} className="mt-4">
          View more
        </button>
      </div>
      {/* Work ontasks */}
      <div className="mt-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
        </div>
        <div className="flex flex-col">
          <TaskListCard></TaskListCard>
          <TaskListCard></TaskListCard>
          <TaskListCard></TaskListCard>
        </div>
      </div>
    </Layout>
  );
}
export default Dashboard;
