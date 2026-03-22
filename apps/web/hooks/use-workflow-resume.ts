"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

type ResumePayload =
  | { action: "approve"; projectId: string }
  | { action: "edit"; projectId: string; screenId: string; feedback: string }
  | { action: "variants"; projectId: string; screenId: string; variantPrompt: string };

export function useWorkflowResume(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ResumePayload) => {
      const res = await fetch("/api/fullstack-apps/workflow/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to resume workflow");
      return res.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workflowStatus.detail(projectId),
        });
      }
    },
  });
}
