"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export interface ThreadItem {
  id: string;
  title?: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export function useThreads(agentId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.threads.list(agentId);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/threads?agentId=${agentId}`);
      const data = await res.json();
      return (data.threads ?? []) as ThreadItem[];
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (threadId: string) => {
      await fetch(`/api/threads?threadId=${threadId}&agentId=${agentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey: key }),
    [queryClient, key]
  );

  const deleteThread = useCallback(
    (threadId: string) => deleteMutation.mutateAsync(threadId),
    [deleteMutation]
  );

  return { threads, isLoading, refetch, deleteThread };
}
