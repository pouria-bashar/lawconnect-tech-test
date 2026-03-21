import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Stack Apps",
  description: "AI-powered full stack app generator",
};

export default function FullStackAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
