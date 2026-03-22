"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { type WorkflowPhase } from "@/hooks/use-workflow-status";

export type DesignScreen = { screenId: string; htmlUrl: string };

const DESIGN_PHASES: WorkflowPhase[] = ["design", "design_suspended"];

export function useDesignScreens(projectId: string | null, phase: WorkflowPhase = null) {
  const isDesignActive = DESIGN_PHASES.includes(phase);

  return useQuery({
    queryKey: queryKeys.designScreens.list(projectId ?? ""),
    queryFn: async () => {
      const res = await fetch(
        `/api/fullstack-apps/design/html?projectId=${encodeURIComponent(projectId!)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch design screens");
      return res.json() as Promise<{ screens: DesignScreen[] }>;
    },
    enabled: !!projectId,
    refetchInterval: isDesignActive ? 5_000 : false,
    staleTime: 0,
  });
}
