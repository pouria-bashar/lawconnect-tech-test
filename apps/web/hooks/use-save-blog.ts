import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";

export type AsyncState = "idle" | "loading" | "success" | "error";

const statusMap: Record<string, AsyncState> = {
  pending: "loading",
  success: "success",
  error: "error",
  idle: "idle",
};
export function toAsyncState(status: string): AsyncState {
  return statusMap[status] ?? "idle";
}

interface SaveBlogParams {
  title: string;
  tags: string[];
  content: JSONContent;
}

export function useSaveBlog() {
  const mutation = useMutation({
    mutationFn: async (params: SaveBlogParams) => {
      const res = await fetch("/api/blogs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to save blog");
      return res.json();
    },
  });

  const state = toAsyncState(mutation.status);

  return {
    state,
    save: mutation.mutateAsync,
    reset: mutation.reset,
  };
}
