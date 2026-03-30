import { NextRequest, NextResponse } from "next/server";
import { addEvent, type WebhookEvent } from "@/lib/store";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resource = body.resource ?? {};
    const fields = resource.fields ?? resource.revision?.fields ?? {};

    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      eventType: body.eventType ?? "unknown",
      timestamp: body.createdDate ?? new Date().toISOString(),
      workItemId: resource.id ?? resource.workItemId ?? null,
      title: fields["System.Title"] ?? "",
      workItemType: fields["System.WorkItemType"] ?? "",
      state: fields["System.State"] ?? "",
      assignedTo:
        fields["System.AssignedTo"]?.displayName ??
        fields["System.AssignedTo"] ??
        "",
      comment: resource.text ?? "",
      raw: body,
    };

    addEvent(event);
    console.log(`Webhook received: ${event.eventType} — Work Item #${event.workItemId}`);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
