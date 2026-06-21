import { NextResponse } from "next/server";
import { getEventsForApiRange } from "@/lib/calendar/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query params required" },
      { status: 400 },
    );
  }

  const events = await getEventsForApiRange(start, end);
  return NextResponse.json(events);
}
