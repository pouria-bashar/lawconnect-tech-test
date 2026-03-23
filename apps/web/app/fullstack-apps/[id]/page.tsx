"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
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
  const { open: sidebarOpen } = useChatSidebar();

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
    const prevAutoPhase = lastAutoPhaseRef.current; // capture before setState (avoid concurrent-mode mutation bug)
    lastAutoPhaseRef.current = active;
    setViewingPhase(prev => (prev === null || prev === prevAutoPhase) ? active : prev);
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
          phase === "setup" || phase === null ? (
            <div className="flex h-full w-full items-center justify-center">
              <WorkflowStepLoader step="setup" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <svg className="size-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Setup complete
              </div>
            </div>
          )
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
              <div className="text-sm text-foreground">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold">{children}</h1>,
                    h2: ({ children }) => <h2 className="mt-5 mb-2 text-base font-semibold">{children}</h2>,
                    h3: ({ children }) => <h3 className="mt-4 mb-1.5 text-sm font-semibold">{children}</h3>,
                    p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    code: ({ children, className }) => {
                      const isBlock = className?.startsWith("language-");
                      return isBlock
                        ? <code className={`block overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed ${className ?? ""}`}>{children}</code>
                        : <code className="rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-xs">{children}</code>;
                    },
                    pre: ({ children }) => <pre className="my-3">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground">{children}</blockquote>,
                    hr: () => <hr className="my-4 border-muted-foreground/20" />,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {plan ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          )
        ) : viewingPhase === "implementation" ? (
          <SandboxEditorPanel projectId={projectId} projectDir={projectDir} />
        ) : null}
      </div>
    </div>
  );
}
