"use client";

import { useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export interface ThreadItem {
  id: string;
  title?: string;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

const PER_PAGE = 10;

export function useThreads(agentId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.threads.list(agentId);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/threads?agentId=${agentId}&page=${pageParam}&perPage=${PER_PAGE}`,
      );
      return res.json() as Promise<{ threads: ThreadItem[]; hasMore: boolean }>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });

  const threads = data?.pages.flatMap((page) => page.threads) ?? [];

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

  return {
    threads,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    deleteThread,
  };
}
