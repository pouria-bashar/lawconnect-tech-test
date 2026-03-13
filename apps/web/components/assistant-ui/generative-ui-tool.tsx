"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  ValidationProvider,
  createStateStore,
  useValidation,
  useActions,
} from "@json-render/react";
import { generativeUiRegistry } from "@/lib/generative-ui-registry";
import type { Spec } from "@json-render/core";

/**
 * Sanitize a (possibly partial) spec for safe rendering.
 */
function sanitizeSpec(raw: Spec): Spec {
  const elements: Record<string, any> = {};

  for (const [id, el] of Object.entries(raw.elements)) {
    if (!el || typeof (el as any).type !== "string" || !(el as any).type)
      continue;
    elements[id] = {
      ...el,
      props:
        (el as any).props && typeof (el as any).props === "object"
          ? (el as any).props
          : {},
      children: Array.isArray((el as any).children)
        ? (el as any).children
        : [],
    };
  }

  for (const [id, el] of Object.entries(elements)) {
    el.children = el.children.filter(
      (childId: string) =>
        typeof childId === "string" && childId !== id && childId in elements,
    );
  }

  return { ...raw, elements };
}

function SubmitHandlerRegistrar({
  store,
  onSubmit,
}: {
  store: ReturnType<typeof createStateStore>;
  onSubmit?: (state: Record<string, unknown>) => void;
}) {
  const validation = useValidation();
  const { registerHandler } = useActions();

  useEffect(() => {
    registerHandler("submit", async () => {
      const isValid = validation.validateAll();
      if (!isValid) return;
      const state = store.getSnapshot();
      onSubmit?.(state);
    });
  }, [validation, store, onSubmit, registerHandler]);

  return null;
}

function RenderWithJson({
  spec,
  loading,
  onSubmit,
}: {
  spec: Spec;
  loading: boolean;
  onSubmit?: (state: Record<string, unknown>) => void;
}) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [store] = useState(() => createStateStore(spec.state ?? {}));

  const stateSyncedRef = useRef(false);
  const stateFingerprint = useMemo(
    () => (spec.state ? JSON.stringify(spec.state) : ""),
    [spec.state],
  );
  useEffect(() => {
    if (stateSyncedRef.current) return;
    if (!spec.state || Object.keys(spec.state).length === 0) return;
    for (const [key, value] of Object.entries(spec.state)) {
      store.set(`/${key}`, value);
    }
    stateSyncedRef.current = true;
  }, [stateFingerprint, store, spec.state]);

  return (
    <div className="my-4 w-full rounded-xl border bg-background p-4 sm:p-6">
      <StateProvider store={store}>
        <VisibilityProvider>
          <ValidationProvider>
            <ActionProvider>
              <SubmitHandlerRegistrar store={store} onSubmit={onSubmit} />
              <Renderer spec={spec} registry={generativeUiRegistry} loading={loading} />
            </ActionProvider>
          </ValidationProvider>
        </VisibilityProvider>
      </StateProvider>
      {loading && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Streaming...
        </div>
      )}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className={`size-3 transition-transform ${showJson ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
          {showJson ? "Hide" : "View"} JSON
        </button>
        {showJson && (
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
                setCopied(true);
                clearTimeout(copyTimeoutRef.current);
                copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy JSON"
            >
              {copied ? (
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-3 pr-9 text-xs">
              {JSON.stringify(spec, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export const GenerativeUiToolUI = makeAssistantToolUI<
  {
    root: string;
    elements: Record<string, unknown>;
    state?: Record<string, unknown>;
  },
  { success: boolean; formData?: Record<string, unknown> }
>({
  toolName: "generate_ui",
  render: ({ args, status, addResult }) => {
    const spec = args as Spec | undefined;
    const loading = status.type === "running";

    if (!spec?.root || !spec?.elements) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating UI...
          </div>
        </div>
      );
    }

    const safeSpec = sanitizeSpec(spec);

    const handleSubmit = (state: Record<string, unknown>) => {
      const formData = (state.formData ?? state) as Record<string, unknown>;
      addResult({ success: true, formData });
    };

    return (
      <RenderWithJson
        spec={safeSpec}
        loading={loading}
        onSubmit={handleSubmit}
      />
    );
  },
});
