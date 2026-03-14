"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ChatLayoutProps {
  agentId?: string;
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentThreadId = searchParams?.get("thread") ?? undefined;

  useEffect(() => {
    if (currentThreadId) return;
    router.replace(`${pathname}?thread=${crypto.randomUUID()}`);
  }, [currentThreadId, pathname, router]);

  return <>{children}</>;
}
