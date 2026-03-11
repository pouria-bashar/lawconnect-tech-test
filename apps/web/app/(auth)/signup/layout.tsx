import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your SustainBit account",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
