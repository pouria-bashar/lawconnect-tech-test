"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useWorkflowResume } from "@/hooks/use-workflow-resume";

interface DesignReviewPanelProps {
  projectId: string;
  selectedScreenId: string | null;
}

export function DesignReviewPanel({
  projectId,
  selectedScreenId,
}: DesignReviewPanelProps) {
  const [editFeedback, setEditFeedback] = useState("");
  const [variantPrompt, setVariantPrompt] = useState("");
  const { mutate: resume, isPending } = useWorkflowResume(projectId);

  const handleEdit = () => {
    if (!editFeedback.trim() || !selectedScreenId) return;
    resume({ action: "edit", projectId, screenId: selectedScreenId, feedback: editFeedback.trim() });
    setEditFeedback("");
  };

  const handleVariants = () => {
    if (!variantPrompt.trim() || !selectedScreenId) return;
    resume({ action: "variants", projectId, screenId: selectedScreenId, variantPrompt: variantPrompt.trim() });
    setVariantPrompt("");
  };

  return (
    <div className="border-t bg-background px-4 py-3 flex flex-col gap-3 shrink-0">
      <div className="flex gap-2">
        <Input
          value={editFeedback}
          onChange={(e) => setEditFeedback(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          placeholder="Edit this screen… e.g. make the header darker"
          disabled={isPending || !selectedScreenId}
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEdit}
          disabled={isPending || !editFeedback.trim() || !selectedScreenId}
        >
          Apply Edit
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={variantPrompt}
          onChange={(e) => setVariantPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVariants()}
          placeholder="Generate variants… e.g. try a card-based layout"
          disabled={isPending || !selectedScreenId}
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleVariants}
          disabled={isPending || !variantPrompt.trim() || !selectedScreenId}
        >
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

      {!selectedScreenId && (
        <p className="text-xs text-muted-foreground text-center">
          Select a screen above to enable edit and variant actions
        </p>
      )}
    </div>
  );
}
