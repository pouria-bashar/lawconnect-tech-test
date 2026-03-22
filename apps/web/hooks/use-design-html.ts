"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export type DesignScreen = { screenId: string; htmlUrl: string };

export function useDesignScreens(projectId: string | null) {
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
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
