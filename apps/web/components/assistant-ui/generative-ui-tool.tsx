"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { makeAssistantToolUI, makeAssistantDataUI } from "@assistant-ui/react";
import type { ClaudeStreamEvent } from "@workspace/e2b/run-claude-code";

const DeployContext = createContext<{ threadId?: string }>({});
export function DeployProvider({ threadId, children }: { threadId?: string; children: React.ReactNode }) {
  return <DeployContext.Provider value={{ threadId }}>{children}</DeployContext.Provider>;
}

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
    const dispatched = useRef(false);
    useEffect(() => {
      if (dispatched.current) return;
      dispatched.current = true;
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
  render: function GenerativeUiRender({ result, status, toolCallId }) {
    const { threadId } = useContext(DeployContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [deployResult, setDeployResult] = useState<{ url: string; scriptName: string } | null>(null);
    const [showDeployDialog, setShowDeployDialog] = useState(false);
    const [deployError, setDeployError] = useState<string | null>(null);
    const loading = status.type === "running";
    const events = useBuildProgress(loading);

    const handleDeploy = useCallback(async () => {
      if (!result?.url || deploying) return;
      setDeploying(true);
      setDeployError(null);
      try {
        const scriptName = threadId ? `genui-${threadId}` : undefined;
        const res = await fetch("/api/generative-ui/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: result.url, scriptName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Deployment failed");
        setDeployResult({ url: data.url, scriptName: data.scriptName });
        setShowDeployDialog(true);
      } catch (e) {
        setDeployError(e instanceof Error ? e.message : "Deployment failed");
      } finally {
        setDeploying(false);
      }
    }, [result?.url, deploying, threadId]);

    const handleCancel = useCallback(async () => {
      if (!toolCallId || cancelling) return;
      setCancelling(true);
      try {
        await fetch(`/api/generative-ui/cancel/${toolCallId}`, { method: "POST" });
      } catch {
        setCancelling(false);
      }
    }, [toolCallId, cancelling]);

    if (!result) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {cancelling ? "Cancelling..." : loading ? "Building your UI..." : "Waiting for result..."}
            </div>
            {loading && !cancelling && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel
              </button>
            )}
          </div>
          <BuildProgress events={events} />
        </div>
      );
    }

    if (!result.url) return null;

    return (
      <div className="my-8 w-full">
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
          <div className="flex items-center gap-2">
            {deployResult ? (
              <button
                type="button"
                onClick={() => setShowDeployDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Deployed
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={deploying}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {deploying ? (
                  <>
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deploying...
                  </>
                ) : (
                  "Deploy"
                )}
              </button>
            )}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Open in new tab &rarr;
            </a>
          </div>
        </div>
        {deployError && (
          <p className="text-xs text-destructive mb-2">{deployError}</p>
        )}
        {showDeployDialog && deployResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowDeployDialog(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Deployment Successful</h3>
                <button
                  type="button"
                  onClick={() => setShowDeployDialog(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your UI has been deployed to Cloudflare Workers.
              </p>
              <div className="rounded-lg border bg-muted/30 p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Deployment URL</p>
                <a
                  href={deployResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary break-all hover:underline"
                >
                  {deployResult.url}
                </a>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeployDialog(false)}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Close
                </button>
                <a
                  href={deployResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open site &rarr;
                </a>
              </div>
            </div>
          </div>
        )}
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
