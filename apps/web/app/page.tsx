"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { JsonRenderToolUI } from "@/components/assistant-ui/json-render-tool";
import { FindLawyerToolUI } from "@/components/assistant-ui/find-lawyer-tool";
import { AskQuestionToolUI } from "@/components/assistant-ui/ask-question-tool";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
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
      <JsonRenderToolUI />
      <FindLawyerToolUI />
      <AskQuestionToolUI />
      <div className="relative h-dvh">
        <div className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign out
          </button>
        </div>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
