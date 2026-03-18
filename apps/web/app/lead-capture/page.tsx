"use client";

import { ChatPage } from "@/components/chat-page";
import type { ChatPageConfig } from "@/components/chat-page";
import { JsonRenderToolUI } from "@/components/assistant-ui/json-render-tool";
import { FindLawyerToolUI } from "@/components/assistant-ui/find-lawyer-tool";
import { AskQuestionToolUI } from "@/components/assistant-ui/ask-question-tool";
import { Player } from "@remotion/player";
import { LeadCaptureVideo } from "@/remotion-compositions/LeadCapture";

const HELP_VIDEO = (
  <Player
    component={LeadCaptureVideo}
    compositionWidth={1280}
    compositionHeight={720}
    durationInFrames={450}
    fps={30}
    autoPlay
    loop
    style={{ width: "100%" }}
    controls
  />
);

const CONFIG: ChatPageConfig = {
  chatApi: "/api/leads/chat",
  defaultModel: "anthropic/claude-sonnet-4-5",
  composerPlaceholder: "Describe your legal issue...",
  help: {
    title: "Legal Intake Assistant",
    description:
      "Describe your legal issue and the AI will guide you through a short intake questionnaire.",
    video: HELP_VIDEO,
  },
  welcome: (
    <>
      <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
        <span className="text-emerald-600">Law</span>
        <span>Network</span>
      </h1>
      <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
        Tell me what legal help you need and I'll guide you through the process.
      </p>
    </>
  ),
  suggestions: [
    {
      prompt: "I need help with a family law matter",
      title: "Family Law",
      description: "Divorce, custody, parenting, financial settlement",
    },
    {
      prompt: "I need help with an immigration matter",
      title: "Immigration Law",
      description: "Visas, citizenship, deportation, sponsorship",
    },
    {
      prompt: "I need help with a property matter",
      title: "Property Law",
      description: "Buying, selling, leases, disputes",
    },
  ],
};

export default function Page() {
  return (
    <ChatPage
      config={CONFIG}
      toolUIs={
        <>
          <JsonRenderToolUI />
          <FindLawyerToolUI />
          <AskQuestionToolUI />
        </>
      }
    />
  );
}
