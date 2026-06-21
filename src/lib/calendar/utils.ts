import { format } from "date-fns";

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (hours === 0 && minutes === 0) return "Dia inteiro";
  return format(d, "HH:mm");
}

export function buildDatetime(date: string, time?: string): string {
  const t = time || "09:00";
  return new Date(`${date}T${t}:00`).toISOString();
}

export function splitDatetime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = format(d, "yyyy-MM-dd");
  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (hours === 0 && minutes === 0) {
    return { date, time: "" };
  }
  return {
    date,
    time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}
