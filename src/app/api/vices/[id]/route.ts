import { NextResponse } from "next/server";
import { getViceById } from "@/lib/vices/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const vice = await getViceById(id);

  if (!vice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(vice);
}
