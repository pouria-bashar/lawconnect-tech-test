"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { FileTreeNode } from "@workspace/e2b/run-claude-code";

export type { FileTreeNode };

export function useSandboxFileTree(projectId: string | null, projectDir: string | null) {
  return useQuery<{ tree: FileTreeNode[] }>({
    queryKey: queryKeys.sandboxEditor.tree(projectId ?? ""),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      if (projectDir) params.set("projectDir", projectDir);
      const res = await fetch(`/api/fullstack-apps/editor/tree?${params}`);
      if (!res.ok) throw new Error("Failed to fetch file tree");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useSandboxFile(path: string | null, projectId: string | null) {
  return useQuery<{ content: string }>({
    queryKey: queryKeys.sandboxEditor.file(path ?? ""),
    queryFn: async () => {
      const params = new URLSearchParams({ path: path! });
      if (projectId) params.set("projectId", projectId);
      const res = await fetch(`/api/fullstack-apps/editor/file?${params}`);
      if (!res.ok) throw new Error("Failed to fetch file content");
      return res.json();
    },
    enabled: !!path && !!projectId,
    staleTime: 10_000,
  });
}

export function useSaveFile(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      const params = new URLSearchParams({ path });
      if (projectId) params.set("projectId", projectId);
      const res = await fetch(
        `/api/fullstack-apps/editor/file?${params}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) },
      );
      if (!res.ok) throw new Error("Failed to save file");
    },
    onSuccess: (_, { path, content }) => {
      queryClient.setQueryData(queryKeys.sandboxEditor.file(path), { content });
    },
  });
}
