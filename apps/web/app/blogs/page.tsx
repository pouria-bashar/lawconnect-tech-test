"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { TiptapRenderToolUI } from "@/components/assistant-ui/tiptap-render-tool";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const BLOG_SUGGESTIONS: Suggestion[] = [
  {
    prompt: "Write a blog post about the future of AI in healthcare",
    title: "AI in Healthcare",
    description: "Innovations, challenges, and the road ahead",
  },
  {
    prompt: "Write a blog post about best practices for remote work",
    title: "Remote Work",
    description: "Productivity tips, tools, and team culture",
  },
  {
    prompt: "Write a blog post about sustainable living tips",
    title: "Sustainable Living",
    description: "Eco-friendly habits for everyday life",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Blog</span>
      <span>Writer</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Tell me what you want to write about and I'll generate a blog post for
      you.
    </p>
  </>
);

export default function BlogsPage() {
  const router = useRouter();

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/blogs/chat",
    }),
  });

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TiptapRenderToolUI />
      <div className="relative h-dvh">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Home
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign out
          </button>
        </div>
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: BLOG_SUGGESTIONS,
            composerPlaceholder: "Describe the blog post you want to create...",
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
