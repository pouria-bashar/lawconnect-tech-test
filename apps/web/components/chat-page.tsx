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
import { useThreadMessages } from "@/lib/use-thread-messages";
import { DEFAULT_MODEL } from "@/lib/model-config";

export interface ChatPageConfig {
  chatApi: string;
  welcome: React.ReactNode;
  suggestions: Suggestion[];
  composerPlaceholder: string;
  help?: { title: string; description: string; video?: React.ReactNode };
  defaultModel?: string;
  maxWidth?: string;
  adapters?: NonNullable<Parameters<typeof useChatRuntime>[0]>["adapters"];
}

export interface ChatPageProps {
  config: ChatPageConfig;
  /** Tool UI components rendered inside AssistantRuntimeProvider */
  toolUIs?: React.ReactNode;
  /** Optional wrapper rendered inside AssistantRuntimeProvider (e.g. DeployProvider). Receives threadId. */
  contentWrapper?: (props: {
    threadId?: string;
    children: React.ReactNode;
  }) => React.ReactNode;
}

export function ChatPage({ config, toolUIs, contentWrapper }: ChatPageProps) {
  return (
    <Suspense>
      <ChatPageContent
        config={config}
        toolUIs={toolUIs}
        contentWrapper={contentWrapper}
      />
    </Suspense>
  );
}

function ChatPageContent({ config, toolUIs, contentWrapper }: ChatPageProps) {
  const searchParams = useSearchParams();
  // Middleware guarantees ?thread= is always present on chat routes
  const threadId = searchParams?.get("thread")!;

  const { messages: initialMessages, isLoading } = useThreadMessages(
    config.chatApi,
    threadId,
  );

  // Wait for messages to load before mounting the runtime for existing threads,
  // otherwise the runtime initializes empty and ignores late-arriving messages.
  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <ChatRuntime
      key={threadId}
      config={config}
      threadId={threadId}
      initialMessages={initialMessages ?? undefined}
      toolUIs={toolUIs}
      contentWrapper={contentWrapper}
    />
  );
}

function ChatRuntime({
  config,
  threadId,
  initialMessages,
  toolUIs,
  contentWrapper,
}: {
  config: ChatPageConfig;
  threadId?: string;
  initialMessages?: import("ai").UIMessage[];
  toolUIs?: React.ReactNode;
  contentWrapper?: ChatPageProps["contentWrapper"];
}) {
  const [selectedModel, setSelectedModel] = useState(
    config.defaultModel ?? DEFAULT_MODEL,
  );

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: config.chatApi,
      body: { modelId: selectedModel, threadId },
    }),
    ...(config.adapters && { adapters: config.adapters }),
    messages: initialMessages,
  });

  const threadContent = (
    <>
      {toolUIs}
      <div className="relative h-dvh">
        <Thread
          config={{
            maxWidth: config.maxWidth ?? "48rem",
            welcome: config.welcome,
            suggestions: config.suggestions,
            composerPlaceholder: config.composerPlaceholder,
            ...(config.help && { help: config.help }),
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </>
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {contentWrapper
        ? contentWrapper({ threadId, children: threadContent })
        : threadContent}
    </AssistantRuntimeProvider>
  );
}
