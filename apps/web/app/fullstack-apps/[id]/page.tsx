"use client";

import { Suspense, use, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { FullStackAppToolUI } from "@/components/assistant-ui/full-stack-app-tool";
import { FindFileToolUI } from "@/components/assistant-ui/generative-ui-tool";
import { SandboxEditorPanel } from "@/components/assistant-ui/sandbox-editor-dialog";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";
import { useThreadMessages } from "@/hooks/use-thread-messages";
import { DEFAULT_MODEL } from "@/lib/model-config";

const CHAT_API = "/api/fullstack-apps/chat";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SplitPageContent params={params} />
    </Suspense>
  );
}

function SplitPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: threadId } = use(params);
  const { messages: initialMessages, isLoading } = useThreadMessages(
    CHAT_API,
    threadId,
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <SplitLayout
      threadId={threadId}
      initialMessages={initialMessages ?? undefined}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading...</span>
    </div>
  );
}

function SplitLayout({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages?: import("ai").UIMessage[];
}) {
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
      <FullStackAppToolUI />
      <FindFileToolUI />
      <div className="flex h-dvh overflow-hidden">
        {/* Left: chat panel */}
        <div className="flex w-2/5 min-w-0 flex-col border-r overflow-hidden">
          <div className="relative h-full">
            <Thread
              config={{
                maxWidth: "100%",
                welcome: (
                  <p className="text-muted-foreground text-sm">
                    Describe what you want to build
                  </p>
                ),
                suggestions: [],
                composerPlaceholder: "Continue the conversation...",
                selectedModel,
                onModelChange: setSelectedModel,
              }}
            />
          </div>
        </div>
        {/* Right: editor panel */}
        <div className="flex-1 overflow-hidden">
          <SandboxEditorPanel />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
