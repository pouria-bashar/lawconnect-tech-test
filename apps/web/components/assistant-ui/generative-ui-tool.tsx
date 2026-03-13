"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { makeAssistantToolUI, makeAssistantDataUI } from "@assistant-ui/react";
import type { ClaudeStreamEvent } from "@workspace/e2b/run-claude-code";

const MAX_EVENTS = 200;

type EventWithId = ClaudeStreamEvent & { id: number };

// Shared event bus: BuildProgressDataUI pushes events, tool UI consumes them
type Listener = (event: ClaudeStreamEvent) => void;
const listeners = new Set<Listener>();
let nextEventId = 0;

function useBuildProgress(isRunning: boolean) {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const wasRunning = useRef(false);

  // Reset events when a new tool run starts
  useEffect(() => {
    if (isRunning && !wasRunning.current) {
      setEvents([]);
    }
    wasRunning.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const handler: Listener = (event) => {
      const entry: EventWithId = { ...event, id: nextEventId++ };
      setEvents((prev) =>
        prev.length >= MAX_EVENTS ? [...prev.slice(-MAX_EVENTS + 1), entry] : [...prev, entry],
      );
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return events;
}

const TOOL_LABELS: Record<string, string> = {
  Read: "Reading file",
  Write: "Writing file",
  Edit: "Editing file",
  Bash: "Running command",
  Glob: "Searching files",
  Grep: "Searching code",
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function formatEvent(event: ClaudeStreamEvent): string {
  if (event.type === "tool_use" && event.toolName) {
    const label = TOOL_LABELS[event.toolName] ?? event.toolName;
    if (event.toolInput) {
      const path = event.toolInput.file_path || event.toolInput.path || event.toolInput.pattern;
      if (path && typeof path === "string") {
        return `${label}: ${path.split("/").slice(-2).join("/")}`;
      }
      if (event.toolInput.command && typeof event.toolInput.command === "string") {
        return `${label}: ${truncate(event.toolInput.command, 60)}`;
      }
    }
    return label;
  }

  if (event.type === "text" && event.text) return truncate(event.text, 100);
  if (event.type === "tool_result" && event.text) return truncate(event.text, 80);
  if (event.type === "status") return "Finishing up...";
  return "";
}

const EVENT_COLORS: Record<string, { bg: string; dot: string }> = {
  tool_use: { bg: "bg-blue-500/20", dot: "bg-blue-500" },
  tool_result: { bg: "bg-green-500/20", dot: "bg-green-500" },
  status: { bg: "bg-amber-500/20", dot: "bg-amber-500" },
};
const DEFAULT_COLOR = { bg: "bg-muted-foreground/20", dot: "bg-muted-foreground" };

function EventDot({ type }: { type: string }) {
  const { bg, dot } = EVENT_COLORS[type] ?? DEFAULT_COLOR;
  return (
    <span className={`shrink-0 mt-0.5 size-3 rounded-sm flex items-center justify-center ${bg}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
    </span>
  );
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`size-3 transition-transform ${open ? "rotate-90" : ""} ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

function BuildProgress({ events }: { events: EventWithId[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length, isOpen]);

  if (events.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border bg-muted/20">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronIcon open={isOpen} />
        Activity ({events.length} steps)
      </button>
      {isOpen && (
        <div ref={scrollRef} className="max-h-40 overflow-y-auto px-3 pb-2 space-y-0.5">
          {events.map((event, i) => {
            const text = formatEvent(event);
            if (!text) return null;
            return (
              <div
                key={event.id}
                className={`flex items-start gap-2 text-xs ${
                  i === events.length - 1 ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                <EventDot type={event.type} />
                <span className="break-all leading-tight">{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Invisible data UI that captures streamed events and pushes into the shared listener
export const BuildProgressDataUI = makeAssistantDataUI<ClaudeStreamEvent>({
  name: "build-progress",
  render: ({ data }) => {
    useEffect(() => {
      listeners.forEach((fn) => fn(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  },
});

export const GenerativeUiToolUI = makeAssistantToolUI<
  { instructions: string },
  { url: string }
>({
  toolName: "build_ui",
  render: function GenerativeUiRender({ result, status }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const loading = status.type === "running";
    const events = useBuildProgress(loading);

    if (!result) {
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {loading ? "Building your UI..." : "Waiting for result..."}
          </div>
          <BuildProgress events={events} />
        </div>
      );
    }

    if (!result.url) return null;

    return (
      <div className="my-4 w-full">
        {events.length > 0 && <BuildProgress events={events} />}
        <div className="flex items-center justify-between mb-2 mt-2">
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronIcon open={isExpanded} />
            {isExpanded ? "Collapse" : "Expand"} preview
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Open in new tab &rarr;
          </a>
        </div>
        {isExpanded && (
          <iframe
            src={result.url}
            sandbox="allow-scripts allow-same-origin"
            className="w-full rounded-xl border bg-white"
            style={{ height: "600px" }}
            title="Generated UI"
          />
        )}
      </div>
    );
  },
});
