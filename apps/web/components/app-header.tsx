"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@workspace/ui/lib/utils";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/lead-capture", label: "Lead Capture" },
  { href: "/generative-ui", label: "Generative UI" },
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
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-0.5 sm:gap-1">
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

      {/* Mobile burger menu */}
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <button
            type="button"
            className="md:hidden shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Open menu"
          >
            <MenuIcon className="size-5" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <DrawerTitle className="text-sm font-medium">Menu</DrawerTitle>
            <DrawerClose asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                title="Close menu"
              >
                <XIcon className="size-4" />
              </button>
            </DrawerClose>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <DrawerClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </DrawerClose>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t">
            <DrawerClose asChild>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOutIcon className="size-4" />
                Sign out
              </button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Desktop sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="hidden md:inline-flex shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Sign out"
      >
        <LogOutIcon className="size-4" />
      </button>
    </header>
  );
}
