import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Immigration Assistant",
  description: "AI-powered immigration law assistance for visas, citizenship, deportation, sponsorship, and more",
}

export default function ImmigrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
