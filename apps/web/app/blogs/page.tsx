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
import { TiptapRenderToolUI } from "@/components/assistant-ui/tiptap-render-tool";
import { AskQuestionToolUI } from "@/components/assistant-ui/ask-question-tool";
import { ChatLayout } from "@/components/chat-layout";
import { useThreadMessages } from "@/lib/use-thread-messages";
import { DEFAULT_MODEL } from "@/lib/model-config";

const AGENT_ID = "blogAgent";
const CHAT_API = "/api/blogs/chat";

const BLOG_SUGGESTIONS: Suggestion[] = [
  {
    prompt: "Write a blog post about how to choose the right family lawyer in Australia",
    title: "Choosing a Family Lawyer",
    description: "Key factors, questions to ask, and red flags to watch for",
  },
  {
    prompt: "Write a blog post explaining the property settlement process after divorce in Australia",
    title: "Property Settlement After Divorce",
    description: "Steps, timelines, and what to expect",
  },
  {
    prompt: "Write a blog post about common mistakes people make when applying for an Australian visa",
    title: "Visa Application Mistakes",
    description: "Pitfalls to avoid and tips for a successful application",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Blog</span>
      <span>Writer</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Tell me what you want to write about and I'll generate a blog post for you.
    </p>
  </>
);

export default function BlogsPage() {
  return (
    <Suspense>
      <BlogsPageContent />
    </Suspense>
  );
}

function BlogsPageContent() {
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
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TiptapRenderToolUI />
      <AskQuestionToolUI />
      <div className="relative h-dvh">
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: BLOG_SUGGESTIONS,
            composerPlaceholder: "Describe the blog post you want to create...",
            help: {
              title: "Blog Writer",
              description: "Tell the AI what you'd like to write about and it will generate a full blog post with rich formatting.",
            },
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
