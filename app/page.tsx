"use client";

import { useEffect, useState, useCallback } from "react";

interface WebhookEvent {
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

type Filter = "all" | "created" | "updated" | "deleted" | "commented";

const BADGE_MAP: Record<string, { label: string; className: string }> = {
  "workitem.created": { label: "Created", className: "badge-created" },
  "workitem.updated": { label: "Updated", className: "badge-updated" },
  "workitem.deleted": { label: "Deleted", className: "badge-deleted" },
  "workitem.commented": { label: "Commented", className: "badge-commented" },
};

function getBadge(eventType: string) {
  return BADGE_MAP[eventType] ?? { label: eventType, className: "badge-unknown" };
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Home() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch {
      // silently retry on next poll
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClear = async () => {
    await fetch("/api/events?clear=true");
    setEvents([]);
  };

  const filtered =
    filter === "all"
      ? events
      : events.filter((e) => e.eventType === `workitem.${filter}`);

  return (
    <div className="container">
      <header>
        <h1>
          DevOps Webhook Listener
          <span className="event-count">{events.length}</span>
        </h1>
        <div className="status">
          <span className="status-dot" />
          Listening
        </div>
      </header>

      <div className="endpoint-url">
        POST <code>/api/devops-webhook</code>
      </div>

      <div className="filters">
        {(["all", "created", "updated", "deleted", "commented"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )
        )}
        {events.length > 0 && (
          <button className="clear-btn" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>

      <div className="event-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No events yet</p>
            <p>
              Configure your Azure DevOps webhook to POST to{" "}
              <code>/api/devops-webhook</code>
            </p>
          </div>
        ) : (
          filtered.map((event) => {
            const badge = getBadge(event.eventType);
            const isOpen = expandedIds.has(event.id);
            return (
              <div key={event.id} className="event-card">
                <div
                  className="event-header"
                  onClick={() => toggleExpand(event.id)}
                >
                  <span className={`badge ${badge.className}`}>
                    {badge.label}
                  </span>
                  <div className="event-info">
                    <div className="event-title">
                      {event.workItemId ? `#${event.workItemId} ` : ""}
                      {event.title || event.eventType}
                    </div>
                    <div className="event-meta">
                      {[event.workItemType, event.state, event.assignedTo]
                        .filter(Boolean)
                        .join(" · ")}
                      {event.comment && ` — "${event.comment.slice(0, 80)}"`}
                    </div>
                  </div>
                  <span className="event-time">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className={`expand-icon ${isOpen ? "open" : ""}`}>
                    ▶
                  </span>
                </div>
                {isOpen && (
                  <div className="event-body">
                    <pre>{JSON.stringify(event.raw, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
