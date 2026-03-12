"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { TiptapEditor } from "@/components/tiptap-editor";

const staticExtensions = [
  StarterKit,
  Image,
  Link.configure({ openOnClick: false }),
  Underline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Subscript,
  Superscript,
  Youtube,
];

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

function sanitizeContent(node: JSONContent): JSONContent | null {
  if (!node.type) return null;
  if (!node.content) return node;
  return {
    ...node,
    content: node.content
      .map(sanitizeContent)
      .filter((n): n is JSONContent => n !== null),
  };
}

function StreamingPreview({ content }: { content: JSONContent }) {
  const sanitized = sanitizeContent(content);
  if (!sanitized) {
    return <div className="min-h-[200px] px-4 py-3" />;
  }
  const rendered = renderToReactElement({
    content: sanitized,
    extensions: staticExtensions,
  });
  return (
    <div className="tiptap prose prose-neutral dark:prose-invert min-h-[200px] px-4 py-3">
      {rendered}
    </div>
  );
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
      {loading ? (
        <StreamingPreview content={content} />
      ) : (
        <TiptapEditor content={content} />
      )}
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
