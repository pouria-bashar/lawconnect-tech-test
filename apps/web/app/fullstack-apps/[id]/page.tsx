"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { FullStackAppToolUI } from "@/components/assistant-ui/full-stack-app-tool";
import { FindFileToolUI } from "@/components/assistant-ui/generative-ui-tool";
import { DesignToolUI } from "@/components/assistant-ui/design-tool";
import { DesignReviewToolUI } from "@/components/assistant-ui/design-review-tool";
import { SandboxEditorPanel } from "@/components/assistant-ui/sandbox-editor-dialog";
import { WorkflowPhaseBar, type ViewPhase } from "@/components/assistant-ui/workflow-phase-bar";
import { WorkflowStepLoader } from "@/components/assistant-ui/workflow-step-loader";
import { e2bAttachmentAdapter } from "@/lib/e2b-attachment-adapter";
import { useThreadMessages } from "@/hooks/use-thread-messages";
import { useDesignScreens } from "@/hooks/use-design-html";
import { useWorkflowStatus, type WorkflowPhase } from "@/hooks/use-workflow-status";
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
      <DesignReviewToolUI />
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

function activeViewPhase(phase: WorkflowPhase): ViewPhase | null {
  if (!phase) return null;
  if (phase === "setup") return "setup";
  if (phase === "design" || phase === "design_suspended") return "design";
  if (phase === "planning") return "planning";
  if (phase === "implementation" || phase === "completed") return "implementation";
  return null;
}

function RightPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [viewingPhase, setViewingPhase] = useState<ViewPhase | null>(null);
  // Tracks the last phase we auto-set, so user's manual navigation isn't overridden
  const lastAutoPhaseRef = useRef<ViewPhase | null>(null);

  const { data: workflowData } = useWorkflowStatus(projectId);
  const phase = workflowData?.phase ?? null;
  const plan = workflowData?.plan ?? null;
  const projectDir = workflowData?.projectDir ?? null;
  const { data: designData } = useDesignScreens(projectId, phase);
  const screens = designData?.screens ?? [];

  // Auto-advance only if the user is still following the active phase
  useEffect(() => {
    const active = activeViewPhase(phase);
    if (!active) return;
    setViewingPhase(prev => {
      const next = (prev === null || prev === lastAutoPhaseRef.current) ? active : prev;
      lastAutoPhaseRef.current = active;
      return next;
    });
  }, [phase]);

  useEffect(() => {
    if (screens.length > 0 && !selectedScreenId) {
      setSelectedScreenId(screens[0]!.screenId);
    }
  }, [screens.length, selectedScreenId]);

  const selectedHtmlUrl = screens.find((s) => s.screenId === selectedScreenId)?.htmlUrl ?? null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WorkflowPhaseBar phase={phase} viewingPhase={viewingPhase} onPhaseClick={setViewingPhase} />

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {viewingPhase === "setup" ? (
          <div className="flex h-full w-full items-center justify-center">
            <WorkflowStepLoader step="setup" />
          </div>
        ) : viewingPhase === "design" ? (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {screens.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <WorkflowStepLoader step="design" />
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
                    <div className="relative h-full w-full overflow-hidden">
                      <iframe
                        key={selectedScreenId}
                        src={selectedHtmlUrl}
                        className="border-none origin-top-left"
                        title="Design preview"
                        sandbox="allow-scripts allow-same-origin"
                        style={{
                          width: "150%",
                          height: "150%",
                          transform: "scale(0.667)",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Select a screen
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : viewingPhase === "planning" ? (
          phase === "planning" && !plan ? (
            <div className="flex h-full w-full items-center justify-center">
              <WorkflowStepLoader step="planning" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{plan}</pre>
            </div>
          )
        ) : viewingPhase === "implementation" ? (
          <SandboxEditorPanel projectId={projectId} projectDir={projectDir} />
        ) : null}
      </div>
    </div>
  );
}
