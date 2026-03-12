"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";

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
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-sonnet-4-5");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/immigration/chat",
      body: { modelId: selectedModel },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="relative h-[calc(100dvh-3rem)]">
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
