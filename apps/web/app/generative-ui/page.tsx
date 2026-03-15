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
import { GenerativeUiToolUI, DeployProvider, FindFileToolUI } from "@/components/assistant-ui/generative-ui-tool";
import { DEFAULT_MODEL } from "@/lib/model-config";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";
import { ChatLayout } from "@/components/chat-layout";
import { useThreadMessages } from "@/lib/use-thread-messages";

const AGENT_ID = "codingAgent";
const CHAT_API = "/api/generative-ui/chat";

const SUGGESTIONS: Suggestion[] = [
  { prompt: "Build me a login form with email and password", title: "Login Form", description: "Email, password, remember me, forgot password link" },
  { prompt: "Create a landing page for a SaaS product", title: "Landing Page", description: "Hero section, features, testimonials, CTA" },
  { prompt: "Generate a resume/CV layout", title: "Resume / CV", description: "Contact info, experience, skills, education" },
  { prompt: "Build a dashboard with stats and a data table", title: "Dashboard", description: "KPI cards, progress bars, recent activity table" },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">Generative UI</h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">Describe the UI you want to build</p>
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

function ChatRuntime({ threadId, initialMessages }: { threadId?: string; initialMessages?: import("ai").UIMessage[] }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_API,
      body: { modelId: selectedModel, threadId },
    }),
    adapters: { attachments: e2bAttachmentAdapter },
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <DeployProvider threadId={threadId}>
        <GenerativeUiToolUI />
        <FindFileToolUI />
        <div className="relative h-dvh">
          <Thread
            config={{
              maxWidth: "64rem",
              welcome: WELCOME,
              suggestions: SUGGESTIONS,
              composerPlaceholder: "Describe the UI you want to build...",
              selectedModel,
              onModelChange: setSelectedModel,
            }}
          />
        </div>
      </DeployProvider>
    </AssistantRuntimeProvider>
  );
}
