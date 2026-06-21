import { NextResponse } from "next/server";
import { searchLearnings } from "@/lib/studies/queries";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q");
  if (!q) return NextResponse.json([]);
  const results = await searchLearnings(q);
  return NextResponse.json(results);
}
