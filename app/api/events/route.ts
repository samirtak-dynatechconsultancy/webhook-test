import { NextRequest, NextResponse } from "next/server";
import { getEvents, clearEvents } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clear = req.nextUrl.searchParams.get("clear");
  if (clear === "true") {
    clearEvents();
    return NextResponse.json({ status: "cleared" });
  }
  return NextResponse.json(getEvents());
}
