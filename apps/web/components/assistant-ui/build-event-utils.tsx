"use client";

import type { EventWithId } from "@/hooks/use-build-polling";

export const TOOL_LABELS: Record<string, string> = {
  Read: "Reading file",
  Write: "Writing file",
  Edit: "Editing file",
  Bash: "Running command",
  Glob: "Searching files",
  Grep: "Searching code",
};

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

export function formatEvent(event: EventWithId): string {
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

export function EventDot({ type }: { type: string }) {
  const { bg, dot } = EVENT_COLORS[type] ?? DEFAULT_COLOR;
  return (
    <span className={`shrink-0 mt-0.5 size-3 rounded-sm flex items-center justify-center ${bg}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
    </span>
  );
}

export function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
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
