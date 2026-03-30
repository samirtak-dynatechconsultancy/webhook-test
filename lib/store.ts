export interface WebhookEvent {
  id: string;
  eventType: string;
  timestamp: string;
  workItemId: number | null;
  title: string;
  workItemType: string;
  state: string;
  assignedTo: string;
  comment: string;
  raw: Record<string, unknown>;
}

const MAX_EVENTS = 100;
const events: WebhookEvent[] = [];

export function addEvent(event: WebhookEvent) {
  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.length = MAX_EVENTS;
  }
}

export function getEvents(): WebhookEvent[] {
  return events;
}

export function clearEvents() {
  events.length = 0;
}
