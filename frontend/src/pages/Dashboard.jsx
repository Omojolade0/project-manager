import Layout from "@/components/Layout"
import StatsIcon from "@/components/StatsIcon"
import ProjectCard from "@/components/ProjectCard"
import { Button } from "@/components/ui/button";
import TaskListCard from "@/components/TaskListCard";


function Dashboard() {

  return (
    <Layout>
      <div className="grid grid-cols-3 gap-2">
        <StatsIcon title="Active Projects" number={3}></StatsIcon>
        <StatsIcon title="Task Due Soon" number={3}></StatsIcon>
        <StatsIcon title="Active Projects" number={3}></StatsIcon>
      </div>
      <div className="mt-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Main Projects</h2>
          <Button>+ Create Project</Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3" >
          <ProjectCard></ProjectCard>
          <ProjectCard></ProjectCard>
          <ProjectCard></ProjectCard>
        </div>
        <p>view more</p>
      </div>
      <div className="mt-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Task</h2>
        </div>
        <div className="flex flex-col" >
          <TaskListCard></TaskListCard>
          <TaskListCard></TaskListCard>
          <TaskListCard></TaskListCard>
        </div>
      </div>
    </Layout>
  )
}
export default Dashboard