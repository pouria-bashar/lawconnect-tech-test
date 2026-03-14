"use client";

import { useCallback, useEffect, useState } from "react";

export interface ThreadItem {
  id: string;
  title?: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export function useThreads(agentId: string) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/threads?agentId=${agentId}`);
      const data = await res.json();
      const next: ThreadItem[] = data.threads ?? [];
      setThreads((prev) => {
        if (
          prev.length === next.length &&
          prev.every(
            (t, i) =>
              t.id === next[i].id && t.updatedAt === next[i].updatedAt
          )
        )
          return prev;
        return next;
      });
    } catch {
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const deleteThread = useCallback(
    async (threadId: string) => {
      await fetch(`/api/threads?threadId=${threadId}&agentId=${agentId}`, {
        method: "DELETE",
      });
      await refetch();
    },
    [agentId, refetch]
  );

  return { threads, isLoading, refetch, deleteThread };
}
