"use client";

import { useEffect, useRef, useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { Button } from "@workspace/ui/components/button";
import { useCancelBuild } from "@/hooks/use-cancel-build";
import { useBuildPolling, type EventWithId } from "@/hooks/use-build-polling";

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

function formatEvent(event: EventWithId): string {
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
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-muted-foreground"
      >
        <ChevronIcon open={isOpen} />
        Activity ({events.length} steps)
      </Button>
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

export const FullStackAppToolUI = makeAssistantToolUI<
  { instructions: string },
  { jobId: string; status: "running" }
>({
  toolName: "build_full_stack_app",
  render: function FullStackAppRender({ result, status }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showEditorDialog, setShowEditorDialog] = useState(false);

    const jobId = result?.jobId;
    const { events, buildResult, buildStatus } = useBuildPolling(jobId);

    const cancel = useCancelBuild();

    const handleCancel = () => {
      if (jobId) cancel.mutate(jobId);
    };

    const isBuilding = status.type === "running" || buildStatus === "running";
    const finalUrl = buildResult?.url;

    // Building state
    if (isBuilding) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {cancel.isPending ? "Cancelling..." : "Building your app..."}
            </div>
            {!cancel.isPending && (
              <Button variant="destructive" size="xs" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
          <BuildProgress events={events} />
        </div>
      );
    }

    // Cancelled or failed
    if (buildStatus === "cancelled") {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Build was cancelled.</p>
          {events.length > 0 && <BuildProgress events={events} />}
        </div>
      );
    }

    if (buildStatus === "failed" && !finalUrl) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-destructive">Build failed. No output was generated.</p>
          {events.length > 0 && <BuildProgress events={events} />}
        </div>
      );
    }

    // No result yet (waiting for tool to return)
    if (!finalUrl) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Waiting for result...
          </div>
        </div>
      );
    }

    // Completed with result
    return (
      <div className="my-8 w-full">
        {events.length > 0 && <BuildProgress events={events} />}
        <div className="flex items-center justify-between mb-2 mt-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsExpanded((v) => !v)}
            className="gap-1 text-muted-foreground"
          >
            <ChevronIcon open={isExpanded} />
            {isExpanded ? "Collapse" : "Expand"} preview
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" onClick={() => setShowEditorDialog(true)}>
              Open editor
            </Button>
            <Button variant="outline" size="xs" asChild>
              <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab &rarr;
              </a>
            </Button>
          </div>
        </div>
        {showEditorDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowEditorDialog(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Editor</h3>
                <Button variant="ghost" size="icon-sm" onClick={() => setShowEditorDialog(false)}>
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}
        {isExpanded && (
          <iframe
            src={finalUrl}
            sandbox="allow-scripts allow-same-origin"
            className="w-full rounded-xl border bg-white"
            style={{ height: "600px" }}
            title="Generated App"
          />
        )}
      </div>
    );
  },
});
