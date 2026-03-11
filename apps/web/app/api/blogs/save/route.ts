import { saveBlog } from "@workspace/db/queries/blog";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { title, content, tags } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 },
    );
  }

  try {
    const post = await saveBlog({
      title,
      content,
      tags: tags ?? [],
    });
    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("Blog save error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save blog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
