"use client";

import { ChatPage } from "@/components/chat-page";
import type { ChatPageConfig } from "@/components/chat-page";
import {
  GenerativeUiToolUI,
  DeployProvider,
  FindFileToolUI,
} from "@/components/assistant-ui/generative-ui-tool";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";

const CONFIG: ChatPageConfig = {
  chatApi: "/api/generative-ui/chat",
  maxWidth: "64rem",
  composerPlaceholder: "Describe the UI you want to build...",
  adapters: { attachments: e2bAttachmentAdapter },
  welcome: (
    <>
      <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-bold text-2xl tracking-tight duration-200">
        Generative UI
      </h1>
      <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
        Describe the UI you want to build
      </p>
    </>
  ),
  suggestions: [
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
  ],
};

export default function Page() {
  return (
    <ChatPage
      config={CONFIG}
      toolUIs={
        <>
          <GenerativeUiToolUI />
          <FindFileToolUI />
        </>
      }
      contentWrapper={({ threadId, children }) => (
        <DeployProvider threadId={threadId}>{children}</DeployProvider>
      )}
    />
  );
}
