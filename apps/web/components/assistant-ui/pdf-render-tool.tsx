"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import type { Spec, UIElement } from "@json-render/core";

/**
 * Sanitize a (possibly partial) PDF spec.
 * Drops elements without a valid type and strips dangling children.
 */
function sanitizeSpec(raw: Spec): Spec {
  const elements: Record<string, UIElement> = {};

  for (const [id, el] of Object.entries(raw.elements)) {
    if (!el || typeof el.type !== "string" || !el.type) continue;
    elements[id] = {
      ...el,
      props: el.props && typeof el.props === "object" ? el.props : {},
      children: Array.isArray(el.children) ? el.children : [],
    };
  }

  for (const [id, el] of Object.entries(elements)) {
    el.children = el.children!.filter(
      (childId) =>
        typeof childId === "string" && childId !== id && childId in elements,
    );
  }

  return { ...raw, elements };
}

function isRenderableSpec(spec: Spec): boolean {
  const root = spec.elements[spec.root];
  if (!root || root.type !== "Document" || !root.children?.length) return false;
  const firstChild = spec.elements[root.children[0]!];
  return firstChild?.type === "Page";
}

function PdfPreview({ spec, loading }: { spec: Spec; loading: boolean }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const lastSpecKey = useRef<string>("");

  const renderPdf = useCallback(async (specToRender: Spec) => {
    const specKey = JSON.stringify(specToRender);
    if (specKey === lastSpecKey.current) return;
    lastSpecKey.current = specKey;

    setRendering(true);
    setError(null);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: specToRender }),
      });
      if (!res.ok) throw new Error("Failed to render PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const prev = pdfUrlRef.current;
      pdfUrlRef.current = url;
      setPdfUrl(url);

      if (prev) URL.revokeObjectURL(prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF render failed");
    } finally {
      setRendering(false);
    }
  }, []);

  // Render when spec is complete (not loading) or periodically during streaming
  useEffect(() => {
    if (!isRenderableSpec(spec)) return;

    if (!loading) {
      renderPdf(spec);
      return;
    }

    // During streaming, refresh every 2s
    const interval = setInterval(() => {
      renderPdf(spec);
    }, 2000);
    return () => clearInterval(interval);
  }, [spec, loading, renderPdf]);

  const handleDownload = async () => {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec, download: true }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 w-full">
      <div className="rounded-xl border overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-xs">PDF Preview</span>
            {(loading || rendering) && (
              <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </div>
          {pdfUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          )}
        </div>

        {/* PDF iframe */}
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full border-none bg-neutral-600"
            style={{ height: "600px" }}
            title="PDF preview"
          />
        ) : error ? (
          <div className="flex items-center justify-center p-8 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Rendering PDF...
          </div>
        )}
      </div>
    </div>
  );
}

export const PdfRenderToolUI = makeAssistantToolUI<
  { root: string; elements: Record<string, unknown> },
  { success: boolean }
>({
  toolName: "render_pdf",
  render: ({ args, status }) => {
    const spec = args as Spec | undefined;
    const loading = status.type === "running";

    // No root or elements yet
    if (!spec?.root || !spec?.elements) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating PDF...
          </div>
        </div>
      );
    }

    const safeSpec = sanitizeSpec(spec);

    if (!safeSpec.elements[safeSpec.root]) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating PDF...
          </div>
        </div>
      );
    }

    return <PdfPreview spec={safeSpec} loading={loading} />;
  },
});
