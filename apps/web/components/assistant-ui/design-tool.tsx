"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

export const DesignToolUI = makeAssistantToolUI<
  { prompt: string; projectTitle: string },
  { stitchProjectId: string; screenId: string; htmlUrl: string; imageUrl: string }
>({
  toolName: "design_screen",
  render: function DesignRender({ result, status }) {
    const isLoading = status.type === "running";

    if (isLoading) {
      return (
        <div className="my-3 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Generating design...
        </div>
      );
    }

    if (!result?.stitchProjectId) return null;

    return (
      <div className="my-3 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <svg className="size-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Design ready — open the Design tab to preview
      </div>
    );
  },
});
