"use client";

import { useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { Button } from "@workspace/ui/components/button";
import { useWorkflowResume } from "@/hooks/use-workflow-resume";
import { useWorkflowStatus } from "@/hooks/use-workflow-status";
import { useDesignScreens } from "@/hooks/use-design-html";

export const DesignReviewToolUI = makeAssistantToolUI<
  Record<string, never>,
  { projectId: string }
>({
  toolName: "show_design_review",
  render: function DesignReviewRender({ result, status }) {
    const projectId = result?.projectId ?? null;
    const { data: workflowData } = useWorkflowStatus(projectId);
    const phase = workflowData?.phase ?? null;
    // Always treat as design_suspended — this tool only renders after design_screen completes
    const { data: designData } = useDesignScreens(projectId, "design_suspended");
    const screens = designData?.screens ?? [];
    const [editFeedback, setEditFeedback] = useState("");
    const [variantPrompt, setVariantPrompt] = useState("");
    const { mutate: resume, isPending } = useWorkflowResume(projectId);

    
    if (status.type === "running" || !projectId || phase === "design") {
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Generating your design…
        </div>
      );
    }

    if (phase === "planning" || phase === "implementation" || phase === "completed") {
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <svg className="size-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Design approved
        </div>
      );
    }

    if (screens.length === 0) {
      return (
        <div className="my-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading design preview…
        </div>
      );
    }

    const firstScreenId = screens[0]!.screenId;

    const handleEdit = () => {
      if (!editFeedback.trim()) return;
      resume({ action: "edit", projectId, screenId: firstScreenId, feedback: editFeedback.trim() });
      setEditFeedback("");
    };

    const handleVariants = () => {
      if (!variantPrompt.trim()) return;
      resume({ action: "variants", projectId, screenId: firstScreenId, variantPrompt: variantPrompt.trim() });
      setVariantPrompt("");
    };

    return (
      <div className="my-2 rounded-lg border bg-muted/30 p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">
          {screens.length} screen{screens.length > 1 ? "s" : ""} ready — review in the panel on the right
        </p>

        <div className="flex flex-col gap-1.5">
          <textarea
            value={editFeedback}
            onChange={(e) => setEditFeedback(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(); } }}
            placeholder="Edit the design… e.g. make the header darker"
            disabled={isPending}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-none"
          />
          <Button variant="secondary" size="sm" onClick={handleEdit} disabled={isPending || !editFeedback.trim()} className="self-end">
            Apply Edit
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <textarea
            value={variantPrompt}
            onChange={(e) => setVariantPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleVariants(); } }}
            placeholder="Try a variant… e.g. card-based layout"
            disabled={isPending}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-none"
          />
          <Button variant="secondary" size="sm" onClick={handleVariants} disabled={isPending || !variantPrompt.trim()} className="self-end">
            Variants
          </Button>
        </div>

        <Button
          onClick={() => resume({ action: "approve", projectId })}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Processing…" : "Approve Design →"}
        </Button>
      </div>
    );
  },
});
