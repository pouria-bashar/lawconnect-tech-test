"use client";

import { ChatPage } from "@/components/chat-page";
import type { ChatPageConfig } from "@/components/chat-page";

const CONFIG: ChatPageConfig = {
  chatApi: "/api/immigration/chat",
  defaultModel: "google/gemini-2.5-flash",
  composerPlaceholder: "Ask an immigration question...",
  help: {
    title: "Immigration Law Assistant",
    description:
      "Ask any immigration law question and the AI will research and provide detailed guidance on visas, citizenship, deportation, sponsorship, and more.",
  },
  welcome: (
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
  ),
  suggestions: [
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
      prompt:
        "I'm facing deportation and need to understand my options",
      title: "Deportation Defence",
      description: "Appeals, legal options, and next steps",
    },
    {
      prompt: "How can I sponsor a family member to immigrate?",
      title: "Family Sponsorship",
      description: "Eligibility, obligations, and processing times",
    },
  ],
};

export default function Page() {
  return <ChatPage config={CONFIG} />;
}
