"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { GenerativeUiToolUI, BuildProgressDataUI } from "@/components/assistant-ui/generative-ui-tool";
import { DEFAULT_MODEL } from "@/lib/model-config";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";

const SUGGESTIONS: Suggestion[] = [
  {
    prompt: "Build me a login form with email and password",
    title: "Login Form",
    description: "Email, password, remember me, forgot password link",
  },
  {
    prompt: "Create a landing page for a SaaS product",
    title: "Landing Page",
    description: "Hero section, features, testimonials, CTA",
  },
  {
    prompt: "Generate a resume/CV layout",
    title: "Resume / CV",
    description: "Contact info, experience, skills, education",
  },
  {
    prompt: "Build a dashboard with stats and a data table",
    title: "Dashboard",
    description: "KPI cards, progress bars, recent activity table",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      Generative UI
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Describe the UI you want to build
    </p>
  </>
);

export default function Page() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedTheme, setSelectedTheme] = useState("modern-minimal");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/generative-ui/chat",
      body: { modelId: selectedModel, themeId: selectedTheme },
    }),
    adapters: {
      attachments: e2bAttachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <GenerativeUiToolUI />
      <BuildProgressDataUI />
      <div className="relative h-[calc(100dvh-3rem)]">
        <Thread
          config={{
            maxWidth: "64rem",
            welcome: WELCOME,
            suggestions: SUGGESTIONS,
            composerPlaceholder: "Describe the UI you want to build...",
            selectedModel,
            onModelChange: setSelectedModel,
            selectedTheme,
            onThemeChange: setSelectedTheme,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
