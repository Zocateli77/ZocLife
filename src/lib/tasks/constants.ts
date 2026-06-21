export const TASK_STATUSES = [
  "backlog",
  "this_week",
  "today",
  "in_progress",
  "waiting",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  this_week: "Esta semana",
  today: "Hoje",
  in_progress: "Em andamento",
  waiting: "Aguardando",
  done: "Concluído",
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const TASK_CATEGORIES = [
  "personal",
  "training",
  "studies",
  "content",
  "work",
  "projects",
  "home",
  "health",
  "routine",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  personal: "Pessoal",
  training: "Treino",
  studies: "Estudos",
  content: "Conteúdo",
  work: "Trabalho",
  projects: "Projetos",
  home: "Casa",
  health: "Saúde",
  routine: "Rotina",
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  "backlog",
  "this_week",
  "today",
  "in_progress",
  "waiting",
  "done",
];

export const ACTIVE_STATUSES: TaskStatus[] = [
  "backlog",
  "this_week",
  "today",
  "in_progress",
  "waiting",
];
