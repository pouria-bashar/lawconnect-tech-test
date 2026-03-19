"use client";

import { useEffect, useRef, useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { Button } from "@workspace/ui/components/button";
import { useCancelBuild } from "@/hooks/use-cancel-build";
import { useBuildPolling, type EventWithId } from "@/hooks/use-build-polling";
import { formatEvent, EventDot, ChevronIcon } from "@/components/assistant-ui/build-event-utils";

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
        variant="ghost" size="xs"
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

// ---------------------------------------------------------------------------
// FullStackAppToolUI
// ---------------------------------------------------------------------------

export const FullStackAppToolUI = makeAssistantToolUI<
  { instructions: string },
  { jobId: string; status: "running" }
>({
  toolName: "build_full_stack_app",
  render: function FullStackAppRender({ result, status }) {
    const jobId = result?.jobId;
    const { events, buildResult, buildStatus } = useBuildPolling(jobId);
    const cancel = useCancelBuild();

    const handleCancel = () => {
      if (jobId) cancel.mutate(jobId);
    };

    const isBuilding = status.type === "running" || buildStatus === "running";

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

    if (buildStatus === "cancelled") {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Build was cancelled.</p>
          {events.length > 0 && <BuildProgress events={events} />}
        </div>
      );
    }

    if (buildStatus === "failed" && !buildResult?.url) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-destructive">Build failed. No output was generated.</p>
          {events.length > 0 && <BuildProgress events={events} />}
        </div>
      );
    }

    if (!buildResult?.url) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Waiting for result...
          </div>
        </div>
      );
    }

    if (events.length === 0) return null;

    return <BuildProgress events={events} />;
  },
});
