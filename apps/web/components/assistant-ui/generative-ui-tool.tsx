"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { useDeploy } from "@/hooks/use-deploy";
import { useExportPdf } from "@/hooks/use-export-pdf";
import { useCancelBuild } from "@/hooks/use-cancel-build";
import { useBuildPolling, type EventWithId } from "@/hooks/use-build-polling";
import { formatEvent, EventDot, ChevronIcon } from "@/components/assistant-ui/build-event-utils";

const DeployContext = createContext<{ threadId?: string }>({});
export function DeployProvider({ threadId, children }: { threadId?: string; children: React.ReactNode }) {
  return <DeployContext.Provider value={{ threadId }}>{children}</DeployContext.Provider>;
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

export const GenerativeUiToolUI = makeAssistantToolUI<
  { instructions: string },
  { jobId: string; status: "running" }
>({
  toolName: "build_ui",
  render: function GenerativeUiRender({ result, status }) {
    const { threadId } = useContext(DeployContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showDeployDialog, setShowDeployDialog] = useState(false);

    const jobId = result?.jobId;
    const { events, buildResult, buildStatus } = useBuildPolling(jobId);

    const deploy = useDeploy();
    const exportPdf = useExportPdf();
    const cancel = useCancelBuild();

    const handleCancel = () => {
      if (jobId) cancel.mutate(jobId);
    };

    const isBuilding = status.type === "running" || buildStatus === "running";
    const finalUrl = buildResult?.url;
    const finalOutputType = buildResult?.outputType;

    const handleDeploy = () => {
      if (!finalUrl) return;
      deploy.mutate(
        { url: finalUrl, scriptName: threadId ? `genui-${threadId}` : undefined },
        { onSuccess: () => setShowDeployDialog(true) },
      );
    };

    const handleExportPdf = () => {
      if (!finalUrl) return;
      exportPdf.mutate(
        { url: finalUrl },
        {
          onSuccess: (data) => {
            const a = document.createElement("a");
            a.href = data.url;
            a.download = "export.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
        },
      );
    };

    // Building state
    if (isBuilding) {
      return (
        <div className="my-8 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {cancel.isPending ? "Cancelling..." : "Building your UI..."}
            </div>
            {!cancel.isPending && (
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
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronIcon open={isExpanded} />
            {isExpanded ? "Collapse" : "Expand"} preview
          </button>
          <div className="flex items-center gap-2">
            {finalOutputType === "html" && (
              <>
                {deploy.data ? (
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
                    disabled={deploy.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {deploy.isPending ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Deploying...
                      </>
                    ) : (
                      "Deploy"
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exportPdf.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {exportPdf.isPending ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Exporting...
                    </>
                  ) : (
                    "Download PDF"
                  )}
                </button>
              </>
            )}
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              {...((finalOutputType === "png" || finalOutputType === "pdf") ? { download: "" } : {})}
            >
              {(finalOutputType === "png" || finalOutputType === "pdf") ? "Download" : "Open in new tab"} &rarr;
            </a>
          </div>
        </div>
        {deploy.error && (
          <p className="text-xs text-destructive mb-2">{deploy.error.message}</p>
        )}
        {exportPdf.error && (
          <p className="text-xs text-destructive mb-2">{exportPdf.error.message}</p>
        )}
        {showDeployDialog && deploy.data && (
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
                  href={deploy.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary break-all hover:underline"
                >
                  {deploy.data.url}
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
                  href={deploy.data.url}
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
        {isExpanded && (finalOutputType === "png" ? (
          <img
            src={finalUrl}
            alt="Generated output"
            className="w-full rounded-xl border bg-white object-contain"
            style={{ maxHeight: "600px" }}
          />
        ) : (
          <iframe
            src={finalUrl}
            sandbox="allow-scripts allow-same-origin"
            className="w-full rounded-xl border bg-white"
            style={{ height: "600px" }}
            title={finalOutputType === "pdf" ? "Generated PDF" : "Generated UI"}
          />
        ))}
      </div>
    );
  },
});

export const FindFileToolUI = makeAssistantToolUI<
  { filename: string },
  { files: { path: string; url: string }[]; error?: string }
>({
  toolName: "find_file",
  render: function FindFileRender({ result }) {
    if (!result) {
      return (
        <div className="my-4 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Searching sandbox...
          </div>
        </div>
      );
    }

    if (result.error && result.files.length === 0) {
      return (
        <div className="my-4 rounded-lg border bg-muted/30 p-3">
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      );
    }

    return (
      <div className="my-4 rounded-lg border bg-muted/30 p-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          Found {result?.files?.length} file{result?.files?.length !== 1 ? "s" : ""}
        </p>
        {result?.files?.map((file) => (
          <div key={file.path} className="flex items-center justify-between gap-2">
            <span className="text-sm font-mono truncate">{file.path.split("/").pop()}</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Download &darr;
            </a>
          </div>
        ))}
      </div>
    );
  },
});
