import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Generative UI",
  description: "AI-powered UI generator — describe what you want and watch it come to life",
}

export default function GenerativeUiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
