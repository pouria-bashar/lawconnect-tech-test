import type { Metadata } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"

import "@workspace/ui/globals.css"

export const metadata: Metadata = {
  title: {
    default: "LawConnect Tech Test",
    template: "%s | LawConnect Tech Test",
  },
  description: "AI-powered legal assistance and content generation platform",
}
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils";
import { AppHeader } from "@/components/app-header";
import { QueryProvider } from "@/components/query-provider";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <AppHeader />
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
