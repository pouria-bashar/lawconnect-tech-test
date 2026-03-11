import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog Generator",
  description: "AI-powered blog content generation with rich text editing",
}

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
