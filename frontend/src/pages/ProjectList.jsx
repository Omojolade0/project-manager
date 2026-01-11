import Layout from "@/components/Layout"
import ProjectCard from "@/components/ProjectCard"

function ProjectList() {
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-2 mt-3" >
        <ProjectCard></ProjectCard>
        <ProjectCard></ProjectCard>
        <ProjectCard></ProjectCard>
        <ProjectCard></ProjectCard>
        <ProjectCard></ProjectCard>
      </div>
    </Layout>
  )
}
export default ProjectList