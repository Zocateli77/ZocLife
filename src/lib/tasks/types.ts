import type { TaskCategory, TaskPriority, TaskStatus } from "./constants";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory | null;
  project_id: string | null;
  due_date: string | null;
  start_date: string | null;
  estimated_minutes: number | null;
  tags: string[];
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskChecklistItem = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
};

export type TaskActivity = {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  created_at: string;
};

export type ProjectOption = {
  id: string;
  name: string;
  status: string;
};

export type TaskWithRelations = Task & {
  project?: ProjectOption | null;
  checklist_items?: TaskChecklistItem[];
  activity?: TaskActivity[];
};

export type CreateTaskInput = {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string | null;
  start_date?: string | null;
  description?: string | null;
  project_id?: string | null;
  estimated_minutes?: number | null;
  tags?: string[];
  notes?: string | null;
  checklist?: string[];
  sync_calendar?: boolean;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  id: string;
  status?: TaskStatus;
};
