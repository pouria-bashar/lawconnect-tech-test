"use client";

import { useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const GenerativeUiToolUI = makeAssistantToolUI<
  { instructions: string },
  { url: string }
>({
  toolName: "build_ui",
  render: function GenerativeUiRender({ args, result, status }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const loading = status.type === "running";

    if (!result) {
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {loading
              ? "Claude Code is generating your UI..."
              : "Waiting for result..."}
          </div>
          {args?.instructions && (
            <p className="mt-2 text-xs text-muted-foreground/70 line-clamp-2">
              {args.instructions}
            </p>
          )}
        </div>
      );
    }

    if (!result.url) return null;

    return (
      <div className="my-4 w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              className={`size-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
            </svg>
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
