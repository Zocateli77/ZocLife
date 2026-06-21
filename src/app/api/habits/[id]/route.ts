import { NextResponse } from "next/server";
import { getHabitById } from "@/lib/habits/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const habit = await getHabitById(id);

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(habit);
}
