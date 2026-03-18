"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UIMessage } from "ai";

export function useThreadMessages(chatApiPath: string, threadId?: string) {
  const { data: messages = null, isLoading } = useQuery<UIMessage[] | null>({
    queryKey: queryKeys.threadMessages.detail(chatApiPath, threadId),
    queryFn: async () => {
      const res = await fetch(`${chatApiPath}?threadId=${threadId}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!threadId,
  });

  return { messages, isLoading };
}
