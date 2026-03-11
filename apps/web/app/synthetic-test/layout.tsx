import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Synthetic Tests",
  description: "AI-powered synthetic test generation for page loads, login flows, and API health checks",
}

export default function SyntheticTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
