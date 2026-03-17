import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { posts, type InsertPost, type SelectPost } from "@workspace/db/schema/blog";

export async function saveBlog(
  data: Omit<InsertPost, "id" | "createdAt" | "updatedAt">,
): Promise<SelectPost> {
  const [post] = await db.insert(posts).values(data).returning();
  return post!;
}

export async function getBlogById(id: string): Promise<SelectPost | undefined> {
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post;
}
