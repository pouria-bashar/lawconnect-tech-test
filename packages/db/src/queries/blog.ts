import { eq, desc } from "drizzle-orm";
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

export async function listBlogs(
  options: { limit?: number; offset?: number } = {},
): Promise<SelectPost[]> {
  const { limit = 20, offset = 0 } = options;
  return db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateBlog(
  id: string,
  data: Partial<Omit<InsertPost, "id" | "createdAt" | "updatedAt">>,
): Promise<SelectPost | undefined> {
  const [post] = await db
    .update(posts)
    .set(data)
    .where(eq(posts.id, id))
    .returning();
  return post!;
}

export async function deleteBlog(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}
