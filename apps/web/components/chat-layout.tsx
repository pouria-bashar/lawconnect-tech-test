"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useThreads } from "@/lib/use-threads";

interface ChatLayoutProps {
  agentId: string;
  children: React.ReactNode;
}

export function ChatLayout({ agentId, children }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentThreadId = searchParams?.get("thread") ?? undefined;

  const { threads, isLoading, deleteThread } =
    useThreads(agentId);

  useEffect(() => {
    if (currentThreadId) return;
    router.replace(`${pathname}?thread=${crypto.randomUUID()}`);
  }, [currentThreadId, pathname, router]);

  const buildHref = useCallback(
    (threadId: string) => `${pathname}?thread=${threadId}`,
    [pathname]
  );

  const handleNewThread = useCallback(() => {
    router.push(buildHref(crypto.randomUUID()));
  }, [buildHref, router]);

  const handleDelete = useCallback(
    async (threadId: string) => {
      await deleteThread(threadId);
      if (threadId === currentThreadId) {
        router.push(pathname);
      }
    },
    [deleteThread, currentThreadId, pathname, router]
  );

  return (
    <SidebarProvider
      style={{ "--sidebar-top": "3rem" } as React.CSSProperties}
      className="!min-h-[calc(100svh-3rem)]"
    >
      <Sidebar className="!top-[var(--sidebar-top)] !h-[calc(100svh-var(--sidebar-top))]">
        <SidebarHeader className="border-b px-3 py-2">
          <span className="text-sm font-semibold">Threads</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleNewThread}
                  className="bg-primary/10"
                >
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
                    return (
                      <SidebarMenuItem key={thread.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={thread.title ?? "New Chat"}
                        >
                          <Link href={buildHref(thread.id)}>
                            <span className="truncate">
                              {thread.title ?? "New Chat"}
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
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 border-b px-3 py-2 md:hidden">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
