"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";

export function useThreadMessages(chatApiPath: string, threadId?: string) {
  const [messages, setMessages] = useState<UIMessage[] | null>(null);
  const [isLoading, setIsLoading] = useState(!!threadId);

  useEffect(() => {
    if (!threadId) {
      setMessages(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${chatApiPath}?threadId=${threadId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatApiPath, threadId]);

  return { messages, isLoading };
}
