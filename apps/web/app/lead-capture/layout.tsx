import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal Assistant",
  description: "AI-powered legal assistance for family law, immigration, property law, and more",
}

export default function LeadCaptureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
