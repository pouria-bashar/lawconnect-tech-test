import { notFound } from "next/navigation";
import { getBlogById } from "@workspace/db/queries/blog";
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
import type { JSONContent } from "@tiptap/react";

const extensions = [
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

export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let blog;
  try {
    blog = await getBlogById(id);
  } catch {
    notFound();
  }

  if (!blog) {
    notFound();
  }

  const content = renderToReactElement({
    extensions,
    content: blog.content as JSONContent,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{blog.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={blog.createdAt.toISOString()}>
              {blog.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {blog.tags.length > 0 && (
              <>
                
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="whitespace-nowrap rounded-full bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
        <div className="tiptap prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>
      </article>
    </div>
  );
}
