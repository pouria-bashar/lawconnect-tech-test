"use client";

import { useState, useCallback, useRef } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  ValidationProvider,
  createStateStore,
} from "@json-render/react";
import { registry } from "@/lib/json-render";
import type { Spec } from "@json-render/core";

/**
 * Sanitize a (possibly partial) spec for safe rendering.
 * - Drops elements without a valid `type` (still streaming)
 * - Ensures every element has a `props` object and a `children` array
 * - Strips child references that point to missing or circular elements
 */
function sanitizeSpec(raw: Spec): Spec {
  const elements: Record<string, any> = {};

  // First pass: keep only elements that have at least a type string
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

  // Second pass: strip children that reference missing or circular elements
  for (const [id, el] of Object.entries(elements)) {
    el.children = el.children.filter(
      (childId: string) =>
        typeof childId === "string" && childId !== id && childId in elements,
    );
  }

  return { ...raw, elements };
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
  const [store] = useState(() => createStateStore(spec.state ?? {}));

  const submitHandler = useCallback(
    async (_params?: Record<string, unknown>) => {
      console.log("submitHandlersubmitHandlersubmitHandlersubmitHandler", onSubmit)
      
      const state = store.getSnapshot();
      console.log("[json-render] submit action fired, state:", state);
      onSubmit?.(state);
    },
    [onSubmit, store],
  );

  return (
    <div className="my-4 w-full">
      <StateProvider store={store}>
        <VisibilityProvider>
          <ValidationProvider>
            <ActionProvider handlers={{ submit: submitHandler }}>
              <Renderer spec={spec} registry={registry} loading={loading} />
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
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs">
            {JSON.stringify(spec, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export const JsonRenderToolUI = makeAssistantToolUI<
  {
    root: string;
    elements: Record<string, unknown>;
    state?: Record<string, unknown>;
  },
  { success: boolean; formData?: Record<string, unknown> }
>({
  toolName: "render_ui",
  render: ({ args, status, addResult }) => {
    const spec = args as Spec | undefined;
    const loading = status.type === "running";

    // No root or elements yet — show a loading placeholder
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

    // If we have a root but it hasn't been fully defined yet, show placeholder
    if (!safeSpec.elements[safeSpec.root]) {
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

    const handleSubmit = (formData: Record<string, unknown>) => {
      
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
