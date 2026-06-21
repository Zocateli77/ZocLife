import { getProjects } from "@/lib/projects/queries";
import { ProjectsView } from "@/components/projects/projects-view";

export default async function ProjetosPage() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} />;
}
