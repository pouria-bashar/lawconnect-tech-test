"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { TiptapEditor } from "@/components/tiptap-editor";

function useAutoCompleteToolResult(
  status: { type: string },
  addResult: (result: { success: boolean }) => void,
) {
  const addResultRef = useRef(addResult);
  addResultRef.current = addResult;

  useEffect(() => {
    if (status.type === "requires-action") {
      addResultRef.current({ success: true });
    }
  }, [status.type]);
}

function TiptapBlogRenderer({
  title,
  tags,
  content,
  loading,
}: {
  title: string;
  tags: string[];
  content: JSONContent;
  loading: boolean;
}) {
  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border bg-background">
      <div className="border-b bg-muted/30 px-4 py-3">
        <h2 className="font-semibold text-lg">{title || "Untitled"}</h2>
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <TiptapEditor content={content} />
      {loading && (
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating blog...
          </div>
        </div>
      )}
    </div>
  );
}

export const TiptapRenderToolUI = makeAssistantToolUI<
  {
    title: string;
    tags: string[];
    content: JSONContent;
  },
  { success: boolean }
>({
  toolName: "render_blog",
  render: ({ args, status, addResult }) => {
    useAutoCompleteToolResult(status, addResult);

    const loading = status.type === "running";

    if (!args?.content) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating blog...
          </div>
        </div>
      );
    }

    return (
      <TiptapBlogRenderer
        title={args.title || ""}
        tags={args.tags || []}
        content={args.content}
        loading={loading}
      />
    );
  },
});
