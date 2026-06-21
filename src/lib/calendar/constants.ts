export const EVENT_TYPES = [
  "task",
  "workout",
  "reading",
  "content",
  "appointment",
  "project",
  "habit",
  "routine",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  task: "Tarefa",
  workout: "Treino",
  reading: "Leitura",
  content: "Conteúdo",
  appointment: "Compromisso",
  project: "Projeto",
  habit: "Hábito",
  routine: "Rotina",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  task: "bg-teal/20 text-teal-text border-teal/30",
  workout: "bg-amber/20 text-amber border-amber/30",
  reading: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  content: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  appointment: "bg-steel/20 text-steel border-steel/30",
  project: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  habit: "bg-teal/15 text-teal-text border-teal/20",
  routine: "bg-muted text-muted-foreground border-border",
};

export const EVENT_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  planned: "Planejado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const EVENT_PRIORITIES = ["low", "medium", "high"] as const;

export type EventPriority = (typeof EVENT_PRIORITIES)[number];

export const EVENT_PRIORITY_LABELS: Record<EventPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export type CalendarViewMode = "month" | "week" | "day";
