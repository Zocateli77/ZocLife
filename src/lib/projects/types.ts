export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: string;
  priority: string;
  category: string | null;
  start_date: string | null;
  due_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  tasks?: Array<{ id: string; title: string; status: string }>;
  task_count?: number;
  done_count?: number;
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planning: "Planejamento",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  archived: "Arquivado",
};
