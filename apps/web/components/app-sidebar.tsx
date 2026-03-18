"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useThreads } from "@/hooks/use-threads";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Avatar,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  PlusIcon,
  Trash2Icon,
  LogOutIcon,
  ChevronsUpDownIcon,
  SunIcon,
  MoonIcon,
  UserSearchIcon,
  LayoutDashboardIcon,
  AppWindowIcon,
  PenLineIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LoaderIcon,
  SettingsIcon,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/lead-capture", label: "Lead Capture", icon: UserSearchIcon },
  { href: "/generative-ui", label: "Generative UI", icon: LayoutDashboardIcon },
  { href: "/fullstack-apps", label: "Full Stack Apps", icon: AppWindowIcon },
  { href: "/blogs", label: "Blogs", icon: PenLineIcon },
  { href: "/synthetic-test", label: "Tests", icon: FlaskConicalIcon },
  { href: "/immigration", label: "Immigration", icon: GlobeIcon },
];

const AGENT_BY_PATH: Record<string, string> = {
  "/lead-capture": "leadAgent",
  "/generative-ui": "codingAgent",
  "/fullstack-apps": "codingAgent",
  "/blogs": "blogAgent",
  "/synthetic-test": "syntheticTestAgent",
  "/immigration": "immigrationResearchAgent",
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const agentId = AGENT_BY_PATH[pathname] ?? null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">LC</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LawConnect</span>
                  <span className="truncate text-xs">Tech Test</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  tooltip={link.label}
                >
                  <Link href={link.href}>
                    <link.icon className="size-4" />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Thread list — only shown when on a chat page */}
        {agentId && (
          <>
            <SidebarSeparator />
            <Suspense>
              <ThreadList agentId={agentId} pathname={pathname} />
            </Suspense>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function ThreadList({
  agentId,
  pathname,
}: {
  agentId: string;
  pathname: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentThreadId = searchParams?.get("thread") ?? undefined;
  const {
    threads,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    deleteThread,
  } = useThreads(agentId);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const buildHref = React.useCallback(
    (threadId: string) => `${pathname}?thread=${threadId}`,
    [pathname]
  );

  const handleNewThread = React.useCallback(() => {
    router.push(buildHref(crypto.randomUUID()));
  }, [buildHref, router]);

  const handleDelete = React.useCallback(
    async (threadId: string) => {
      await deleteThread(threadId);
      if (threadId === currentThreadId) {
        router.push(pathname);
      }
    },
    [deleteThread, currentThreadId, pathname, router]
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Threads</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleNewThread} className="bg-primary/10">
            <PlusIcon className="size-4" />
            <span>New Thread</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {isLoading
          ? Array.from({ length: 5 }, (_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton>
                  <Skeleton className="h-4 w-full" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          : threads.map((thread) => {
              const isActive = thread.id === currentThreadId;
              const titlePending = !thread.title || thread.title === "New Chat";
              return (
                <SidebarMenuItem key={thread.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={thread.title ?? "New Chat"}
                  >
                    <Link href={buildHref(thread.id)}>
                      {titlePending ? (
                        <LoaderIcon className="size-3 animate-spin shrink-0 text-muted-foreground" />
                      ) : null}
                      <span className="truncate">
                        {titlePending ? "Generating..." : thread.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={() => handleDelete(thread.id)}
                    showOnHover
                  >
                    <Trash2Icon className="size-4" />
                    <span className="sr-only">Delete</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              );
            })}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-1" />
        {isFetchingNextPage && (
          <SidebarMenuItem>
            <SidebarMenuButton>
              <LoaderIcon className="size-3 animate-spin" />
              <span className="text-muted-foreground text-xs">Loading more...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function UserMenu() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userEmail ?? "User"}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
