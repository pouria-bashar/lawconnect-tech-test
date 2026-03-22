"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export type WorkflowPhase =
  | "design"
  | "design_suspended"
  | "planning"
  | "implementation"
  | "completed"
  | null;

export type WorkflowStatus = {
  phase: WorkflowPhase;
  plan: string | null;
  jobId: string | null;
};

export function useWorkflowStatus(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.workflowStatus.detail(projectId ?? ""),
    queryFn: async (): Promise<WorkflowStatus> => {
      const res = await fetch(
        `/api/fullstack-apps/workflow/status?projectId=${encodeURIComponent(projectId!)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch workflow status");
      return res.json();
    },
    enabled: !!projectId,
    refetchInterval: (query) => {
      const phase = query.state.data?.phase;
      if (phase === "completed") return false;
      return 3_000;
    },
    staleTime: 0,
  });
}
