"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { ChatLayout } from "@/components/chat-layout";
import { useThreadMessages } from "@/lib/use-thread-messages";

const AGENT_ID = "immigrationResearchAgent";
const CHAT_API = "/api/immigration/chat";

const IMMIGRATION_SUGGESTIONS: Suggestion[] = [
  {
    prompt: "What are the requirements for a skilled worker visa?",
    title: "Skilled Worker Visa",
    description: "Eligibility, requirements, and application process",
  },
  {
    prompt: "How do I apply for permanent residency?",
    title: "Permanent Residency",
    description: "Pathways, timelines, and documentation needed",
  },
  {
    prompt: "I'm facing deportation and need to understand my options",
    title: "Deportation Defence",
    description: "Appeals, legal options, and next steps",
  },
  {
    prompt: "How can I sponsor a family member to immigrate?",
    title: "Family Sponsorship",
    description: "Eligibility, obligations, and processing times",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Immigration</span>
      <span> Assistant</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Ask me anything about immigration law — visas, citizenship, sponsorship,
      and more.
    </p>
  </>
);

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
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

function ChatRuntime({
  threadId,
  initialMessages,
}: {
  threadId?: string;
  initialMessages?: import("ai").UIMessage[];
}) {
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_API,
      body: { modelId: selectedModel, threadId },
    }),
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="relative h-dvh">
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: IMMIGRATION_SUGGESTIONS,
            composerPlaceholder: "Ask an immigration question...",
            help: {
              title: "Immigration Law Assistant",
              description:
                "Ask any immigration law question and the AI will research and provide detailed guidance on visas, citizenship, deportation, sponsorship, and more.",
            },
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
