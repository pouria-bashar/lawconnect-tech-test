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
import { JsonRenderToolUI } from "@/components/assistant-ui/json-render-tool";
import { FindLawyerToolUI } from "@/components/assistant-ui/find-lawyer-tool";
import { AskQuestionToolUI } from "@/components/assistant-ui/ask-question-tool";
import { Player } from "@remotion/player";
import { LeadCaptureVideo } from "@/remotion-compositions/LeadCapture";
import { ChatLayout } from "@/components/chat-layout";
import { useThreadMessages } from "@/lib/use-thread-messages";

const AGENT_ID = "leadAgent";
const CHAT_API = "/api/leads/chat";

const LEGAL_SUGGESTIONS: Suggestion[] = [
  { prompt: "I need help with a family law matter", title: "Family Law", description: "Divorce, custody, parenting, financial settlement" },
  { prompt: "I need help with an immigration matter", title: "Immigration Law", description: "Visas, citizenship, deportation, sponsorship" },
  { prompt: "I need help with a property matter", title: "Property Law", description: "Buying, selling, leases, disputes" },
];

const HELP_VIDEO = (
  <Player component={LeadCaptureVideo} compositionWidth={1280} compositionHeight={720} durationInFrames={450} fps={30} autoPlay loop style={{ width: "100%" }} controls />
);

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Law</span><span>Network</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Tell me what legal help you need and I'll guide you through the process.
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

function ChatRuntime({ threadId, initialMessages }: { threadId?: string; initialMessages?: import("ai").UIMessage[] }) {
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-sonnet-4-5");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_API,
      body: { modelId: selectedModel, threadId, resourceId: AGENT_ID },
    }),
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <JsonRenderToolUI />
      <FindLawyerToolUI />
      <AskQuestionToolUI />
      <div className="relative h-dvh">
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: LEGAL_SUGGESTIONS,
            composerPlaceholder: "Describe your legal issue...",
            help: { title: "Legal Intake Assistant", description: "Describe your legal issue and the AI will guide you through a short intake questionnaire.", video: HELP_VIDEO },
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
