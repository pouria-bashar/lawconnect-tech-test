"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { PdfRenderToolUI } from "@/components/assistant-ui/pdf-render-tool";

export default function PdfPage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/pdf/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <PdfRenderToolUI />
      <div className="h-dvh">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
