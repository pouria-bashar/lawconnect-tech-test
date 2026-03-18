import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Full Stack Apps",
  description: "AI-powered full stack app generator — describe what you want and watch it come to life",
}

export default function FullStackAppsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
