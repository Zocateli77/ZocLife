import { getTasks, getProjectOptions } from "@/lib/tasks/queries";
import { TasksView } from "@/components/tasks/tasks-view";

export default async function TarefasPage() {
  const [tasks, projects] = await Promise.all([
    getTasks(),
    getProjectOptions(),
  ]);

  return <TasksView initialTasks={tasks} projects={projects} />;
}
