"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import type { Suggestion } from "@/components/assistant-ui/thread";
import { TestRenderToolUI } from "@/components/assistant-ui/test-render-tool";

const TEST_SUGGESTIONS: Suggestion[] = [
  {
    prompt:
      'Navigate to https://lawconnect.com/en-au and verify that the h1 heading "Find trusted lawyers across Australia" is visible',
    title: "Verify H1 Heading",
    description: "Check the main heading is displayed on the homepage",
  },
  {
    prompt:
      'Navigate to https://lawconnect.com/en-au, click on "Find a Lawyer", and verify the search page loads with a search input visible',
    title: "Find a Lawyer Flow",
    description: "Test the lawyer search navigation and page load",
  },
  {
    prompt:
      "Navigate to https://lawconnect.com/en-au and verify that all navigation links in the header return 200 status codes",
    title: "Navigation Links Health",
    description: "Check all header nav links are reachable",
  },
];

const WELCOME = (
  <>
    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
      <span className="text-emerald-600">Synthetic</span>
      <span> Test Generator</span>
    </h1>
    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
      Describe what you want to test and I'll generate a Playwright test you can
      dry run.
    </p>
  </>
);

export default function SyntheticTestPage() {
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/synthetic-test/chat",
      body: { modelId: selectedModel },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TestRenderToolUI />
      <div className="relative h-[calc(100dvh-3rem)]">
        <Thread
          config={{
            maxWidth: "56rem",
            welcome: WELCOME,
            suggestions: TEST_SUGGESTIONS,
            composerPlaceholder:
              "Describe the test you want to create...",
            selectedModel,
            onModelChange: setSelectedModel,
          }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
