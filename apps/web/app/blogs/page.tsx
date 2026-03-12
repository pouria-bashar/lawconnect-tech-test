"use client";

import { useState } from "react";
import { DEFAULT_MODEL } from "@/lib/model-config";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { TiptapRenderToolUI } from "@/components/assistant-ui/tiptap-render-tool";
import { AskQuestionToolUI } from "@/components/assistant-ui/ask-question-tool";

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
      Tell me what you want to write about and I'll generate a blog post for
      you.
    </p>
  </>
);

export default function BlogsPage() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/blogs/chat",
      body: { modelId: selectedModel },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TiptapRenderToolUI />
      <AskQuestionToolUI />
      <div className="relative h-[calc(100dvh-3rem)]">
        <Thread
          config={{
            maxWidth: "48rem",
            welcome: WELCOME,
            suggestions: BLOG_SUGGESTIONS,
            composerPlaceholder: "Describe the blog post you want to create...",
            help: {
              title: "Blog Writer",
              description:
                "Tell the AI what you'd like to write about and it will generate a full blog post with rich formatting. You can review, edit, and save it directly.",
            },
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
