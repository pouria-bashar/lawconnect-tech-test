"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ClaudeStreamEvent, RunResult, BuildJobStatus } from "@workspace/e2b/run-claude-code";
import { queryKeys } from "@/lib/query-keys";

const MAX_EVENTS = 200;
const POLL_INTERVAL_MS = 5000;

export type EventWithId = ClaudeStreamEvent & { id: number };

interface BuildStatusResponse {
  status: BuildJobStatus;
  events: ClaudeStreamEvent[];
  newOffset: number;
  result?: RunResult;
}

export function useBuildPolling(jobId: string | undefined) {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const offsetRef = useRef(0);
  const nextIdRef = useRef(0);

  // Reset accumulated state when jobId changes
  useEffect(() => {
    offsetRef.current = 0;
    nextIdRef.current = 0;
    setEvents([]);
  }, [jobId]);

  const { data } = useQuery({
    queryKey: queryKeys.buildJob.status(jobId ?? ""),
    queryFn: async (): Promise<BuildStatusResponse> => {
      const res = await fetch(`/api/generative-ui/build-status/${jobId}?offset=${offsetRef.current}`);
      if (!res.ok) throw new Error("Failed to fetch build status");
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && status !== "running") return false;
      return POLL_INTERVAL_MS;
    },
  });

  // Accumulate events outside queryFn to avoid side effects on retries
  const prevOffsetRef = useRef(0);
  useEffect(() => {
    if (!data) return;

    // Update offset for next poll
    offsetRef.current = data.newOffset;

    // Only accumulate if we got new data (offset changed)
    if (data.newOffset > prevOffsetRef.current && data.events.length > 0) {
      prevOffsetRef.current = data.newOffset;
      setEvents((prev) => {
        const newEvents = data.events.map((e) => ({ ...e, id: nextIdRef.current++ }));
        const combined = [...prev, ...newEvents];
        return combined.length > MAX_EVENTS ? combined.slice(-MAX_EVENTS) : combined;
      });
    }
  }, [data]);

  return {
    events,
    buildResult: data?.result ?? null,
    buildStatus: data?.status ?? null,
  };
}
