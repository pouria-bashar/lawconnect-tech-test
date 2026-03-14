"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_MODEL } from "@/lib/model-config";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { TestRenderToolUI } from "@/components/assistant-ui/test-render-tool";
import { ChatLayout } from "@/components/chat-layout";
import { useThreadMessages } from "@/lib/use-thread-messages";

const AGENT_ID = "syntheticTestAgent";
const CHAT_API = "/api/synthetic-test/chat";

const TEST_SUGGESTIONS: Suggestion[] = [
  { prompt: 'Navigate to https://lawconnect.com/en-au and verify that the h1 heading "Find trusted lawyers across Australia" is visible', title: "Verify H1 Heading", description: "Check the main heading is displayed on the homepage" },
  { prompt: 'Navigate to https://lawconnect.com/en-au, click on "Find a Lawyer", and verify the search page loads with a search input visible', title: "Find a Lawyer Flow", description: "Test the lawyer search navigation and page load" },
  { prompt: "Navigate to https://lawconnect.com/en-au and verify that all navigation links in the header return 200 status codes", title: "Navigation Links Health", description: "Check all header nav links are reachable" },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Synthetic</span><span> Test Generator</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Describe what you want to test and I'll generate a Playwright test you can dry run.
    </p>
  </>
);

export default function SyntheticTestPage() {
  return (
    <Suspense>
      <SyntheticTestPageContent />
    </Suspense>
  );
}

function SyntheticTestPageContent() {
  const searchParams = useSearchParams();
  const threadId = searchParams?.get("thread") ?? undefined;
  const { messages: initialMessages, isLoading } = useThreadMessages(CHAT_API, threadId);

  return (
    <ChatLayout agentId={AGENT_ID}>
      {isLoading ? (
        <div className="flex h-dvh items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      ) : (
        <ChatRuntime key={threadId ?? "new"} threadId={threadId} initialMessages={initialMessages ?? undefined} />
      )}
    </ChatLayout>
  );
}

function ChatRuntime({ threadId, initialMessages }: { threadId?: string; initialMessages?: import("ai").UIMessage[] }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_API,
      body: { modelId: selectedModel, threadId, resourceId: AGENT_ID },
    }),
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TestRenderToolUI />
      <div className="relative h-dvh">
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: TEST_SUGGESTIONS,
            composerPlaceholder: "Describe the test you want to create...",
            help: { title: "Synthetic Test Generator", description: "Describe what you want to test and the AI will generate a Playwright end-to-end test for you." },
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
