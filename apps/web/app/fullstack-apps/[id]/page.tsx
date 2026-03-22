"use client";

import { Suspense, use, useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { FullStackAppToolUI } from "@/components/assistant-ui/full-stack-app-tool";
import { FindFileToolUI } from "@/components/assistant-ui/generative-ui-tool";
import { DesignToolUI } from "@/components/assistant-ui/design-tool";
import { SandboxEditorPanel } from "@/components/assistant-ui/sandbox-editor-dialog";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";
import { useThreadMessages } from "@/hooks/use-thread-messages";
import { useDesignScreens } from "@/hooks/use-design-html";
import { useChatSidebar } from "@/hooks/use-chat-sidebar";
import { DEFAULT_MODEL } from "@/lib/model-config";

const CHAT_API = "/api/fullstack-apps/chat";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SplitPageContent params={params} />
    </Suspense>
  );
}

function SplitPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: threadId } = use(params);
  const { messages: initialMessages, isLoading } = useThreadMessages(
    CHAT_API,
    threadId,
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <SplitLayout
      threadId={threadId}
      initialMessages={initialMessages ?? undefined}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading...</span>
    </div>
  );
}

function SplitLayout({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages?: import("ai").UIMessage[];
}) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useChatSidebar();

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_API,
      body: { modelId: selectedModel, threadId },
    }),
    adapters: { attachments: e2bAttachmentAdapter },
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <DesignToolUI />
      <FullStackAppToolUI />
      <FindFileToolUI />
      <div className="flex h-dvh overflow-hidden">
        {/* Left: chat panel */}
        <div
          className="flex flex-col border-r overflow-hidden shrink-0 transition-[width] duration-200 ease-linear"
          style={{ width: sidebarOpen ? "30%" : "0px" }}
        >
          <div className="relative flex-1 min-h-0">
            <Thread
              config={{
                maxWidth: "100%",
                welcome: (
                  <p className="text-muted-foreground text-sm">
                    Describe what you want to build
                  </p>
                ),
                suggestions: [],
                composerPlaceholder: "Continue the conversation...",
                selectedModel,
                onModelChange: setSelectedModel,
              }}
            />
          </div>
        </div>
        {/* Right: design + code panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <RightPanel projectId={threadId} />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

type RightTab = "design" | "code";

function RightPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [tab, setTab] = useState<RightTab>("design");
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  const { data } = useDesignScreens(projectId);
  const screens = data?.screens ?? [];

  useEffect(() => {
    if (screens.length > 0) {
      if (!selectedScreenId) setSelectedScreenId(screens[0]!.screenId);
      if (tab !== "design") setTab("design");
    }
  }, [screens.length, selectedScreenId, tab]);

  const selectedHtmlUrl = screens.find((s) => s.screenId === selectedScreenId)?.htmlUrl ?? null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center border-b shrink-0">
        <TabButton active={tab === "design"} onClick={() => setTab("design")}>
          Design
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")}>
          Code
        </TabButton>
      </div>

      <div className="flex flex-1 w-full overflow-hidden">
        {tab === "design" ? (
          screens.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Design will appear here once generated
            </div>
          ) : (
            <>
              {screens.length > 1 && (
                <div className="w-36 shrink-0 border-r overflow-y-auto bg-muted/20 py-2 px-2 flex flex-col gap-1">
                  {screens.map((screen, i) => (
                    <button
                      key={screen.screenId}
                      onClick={() => setSelectedScreenId(screen.screenId)}
                      className={`rounded px-2 py-1.5 text-left text-xs transition-colors ${
                        selectedScreenId === screen.screenId
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      Screen {i + 1}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                {selectedHtmlUrl ? (
                  <iframe
                    key={selectedScreenId}
                    src={selectedHtmlUrl}
                    className="h-full w-full border-none"
                    title="Design preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Select a screen
                  </div>
                )}
              </div>
            </>
          )
        ) : (
          <SandboxEditorPanel />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm transition-colors ${
        active
          ? "border-b-2 border-primary font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
