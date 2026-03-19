"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { FileTreeNode } from "@workspace/e2b/run-claude-code";

export type { FileTreeNode };

export function useSandboxFileTree() {
  return useQuery<{ tree: FileTreeNode[] }>({
    queryKey: queryKeys.sandboxEditor.tree(),
    queryFn: async () => {
      const res = await fetch("/api/fullstack-apps/editor/tree");
      if (!res.ok) throw new Error("Failed to fetch file tree");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useSandboxFile(path: string | null) {
  return useQuery<{ content: string }>({
    queryKey: queryKeys.sandboxEditor.file(path ?? ""),
    queryFn: async () => {
      const res = await fetch(
        `/api/fullstack-apps/editor/file?path=${encodeURIComponent(path!)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch file content");
      return res.json();
    },
    enabled: !!path,
    staleTime: 10_000,
  });
}

export function useSaveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      const res = await fetch(
        `/api/fullstack-apps/editor/file?path=${encodeURIComponent(path)}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) },
      );
      if (!res.ok) throw new Error("Failed to save file");
    },
    onSuccess: (_, { path, content }) => {
      queryClient.setQueryData(queryKeys.sandboxEditor.file(path), { content });
    },
  });
}
