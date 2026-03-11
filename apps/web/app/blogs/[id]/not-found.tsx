import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Blog not found</h1>
      <p className="mt-3 text-muted-foreground">
        The blog post you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/blogs"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to blogs
      </Link>
    </div>
  );
}
