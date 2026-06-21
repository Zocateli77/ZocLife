import type {
  EventPriority,
  EventStatus,
  EventType,
} from "./constants";

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_datetime: string;
  end_datetime: string | null;
  status: EventStatus;
  priority: EventPriority;
  related_task_id: string | null;
  related_project_id: string | null;
  related_content_id: string | null;
  related_document_id: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LinkedTask = { id: string; title: string; status: string };
export type LinkedProject = { id: string; name: string };
export type LinkedContent = {
  id: string;
  title: string;
  script_url: string | null;
  script_text: string | null;
};
export type LinkedDocument = {
  id: string;
  title: string;
  url: string | null;
  content: string | null;
  document_type: string;
};

export type CalendarEventWithRelations = CalendarEvent & {
  task?: LinkedTask | null;
  project?: LinkedProject | null;
  content?: LinkedContent | null;
  document?: LinkedDocument | null;
  // Set on expanded occurrences of a recurring event; unique per occurrence so
  // it can be used as a React key without colliding with the shared anchor id.
  occurrence_key?: string;
};

export type CreateEventInput = {
  title: string;
  description?: string | null;
  event_type?: EventType;
  start_datetime: string;
  end_datetime?: string | null;
  status?: EventStatus;
  priority?: EventPriority;
  related_task_id?: string | null;
  related_project_id?: string | null;
  related_content_id?: string | null;
  related_document_id?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: string | null;
  notes?: string | null;
  new_document_title?: string | null;
  new_document_url?: string | null;
};

export type UpdateEventInput = Partial<CreateEventInput> & { id: string };

export type SelectOption = { id: string; label: string };
