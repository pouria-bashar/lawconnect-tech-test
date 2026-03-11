"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { TestRenderToolUI } from "@/components/assistant-ui/test-render-tool";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const TEST_SUGGESTIONS: Suggestion[] = [
  {
    prompt:
      "Write a test that checks if https://example.com loads correctly and has the main heading visible",
    title: "Basic Page Load",
    description: "Verify a page loads and displays key elements",
  },
  {
    prompt:
      "Write a test that fills out a login form, submits it, and verifies the user is redirected to the dashboard",
    title: "Login Flow",
    description: "Test authentication with form submission",
  },
  {
    prompt:
      "Write a test that checks if an API endpoint returns a 200 status and valid JSON response",
    title: "API Health Check",
    description: "Verify API availability and response format",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Synthetic</span>
      <span> Test Generator</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Describe what you want to test and I'll generate a Playwright test you can
      dry run.
    </p>
  </>
);

export default function SyntheticTestPage() {
  const router = useRouter();

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/synthetic-test/chat",
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
      <TestRenderToolUI />
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
            maxWidth: "56rem",
            welcome: WELCOME,
            suggestions: TEST_SUGGESTIONS,
            composerPlaceholder:
              "Describe the test you want to create...",
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
