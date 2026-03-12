"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@workspace/ui/lib/utils";
import { LogOutIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/lead-capture", label: "Lead Capture" },
  { href: "/blogs", label: "Blogs" },
  { href: "/synthetic-test", label: "Tests" },
  { href: "/immigration", label: "Immigration" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b bg-background/95 px-2 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-md px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors",
              pathname === link.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleSignOut}
        className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Sign out"
      >
        <LogOutIcon className="size-4" />
      </button>
    </header>
  );
}
