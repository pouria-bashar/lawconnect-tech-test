import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/react";

export type AsyncState = "idle" | "loading" | "success" | "error";

interface SaveBlogParams {
  title: string;
  tags: string[];
  content: JSONContent;
}

export function useSaveBlog() {
  const [state, setState] = useState<AsyncState>("idle");

  const save = useCallback(async (params: SaveBlogParams) => {
    setState("loading");
    try {
      const res = await fetch("/api/blogs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setState("success");
      return data;
    } catch {
      setState("error");
      throw new Error("Failed to save blog");
    }
  }, []);

  const reset = useCallback(() => setState("idle"), []);

  return { state, save, reset };
}
