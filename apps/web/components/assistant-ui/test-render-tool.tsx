"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@workspace/ui/lib/utils";
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import dynamic from "next/dynamic";

import type { Monaco } from "@monaco-editor/react";

function configureMonaco(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    moduleResolution:
      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    noEmit: true,
  });

  // Provide a stub type declaration for @playwright/test
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module "@playwright/test" {
  export interface Page {
    goto(url: string, options?: any): Promise<any>;
    click(selector: string, options?: any): Promise<void>;
    fill(selector: string, value: string, options?: any): Promise<void>;
    waitForSelector(selector: string, options?: any): Promise<any>;
    waitForURL(url: string | RegExp, options?: any): Promise<void>;
    waitForLoadState(state?: string, options?: any): Promise<void>;
    waitForTimeout(timeout: number): Promise<void>;
    title(): Promise<string>;
    url(): string;
    content(): Promise<string>;
    screenshot(options?: any): Promise<Buffer>;
    locator(selector: string): Locator;
    getByRole(role: string, options?: any): Locator;
    getByText(text: string | RegExp, options?: any): Locator;
    getByLabel(text: string | RegExp, options?: any): Locator;
    getByPlaceholder(text: string | RegExp, options?: any): Locator;
    getByTestId(testId: string | RegExp): Locator;
    evaluate<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>;
    [key: string]: any;
  }
  export interface Locator {
    click(options?: any): Promise<void>;
    fill(value: string, options?: any): Promise<void>;
    type(text: string, options?: any): Promise<void>;
    press(key: string, options?: any): Promise<void>;
    check(options?: any): Promise<void>;
    uncheck(options?: any): Promise<void>;
    selectOption(values: any, options?: any): Promise<string[]>;
    isVisible(): Promise<boolean>;
    isEnabled(): Promise<boolean>;
    isChecked(): Promise<boolean>;
    textContent(): Promise<string | null>;
    innerText(): Promise<string>;
    getAttribute(name: string): Promise<string | null>;
    count(): Promise<number>;
    first(): Locator;
    last(): Locator;
    nth(index: number): Locator;
    getByRole(role: string, options?: any): Locator;
    getByText(text: string | RegExp, options?: any): Locator;
    getByLabel(text: string | RegExp, options?: any): Locator;
    getByPlaceholder(text: string | RegExp, options?: any): Locator;
    getByTestId(testId: string | RegExp): Locator;
    locator(selector: string): Locator;
    [key: string]: any;
  }
  export interface BrowserContext { [key: string]: any; }
  export interface Browser { [key: string]: any; }
  export interface TestInfo { [key: string]: any; }
  export interface Expect {
    (value: any): any;
    (locator: Locator): {
      toBeVisible(options?: any): Promise<void>;
      toBeHidden(options?: any): Promise<void>;
      toBeEnabled(options?: any): Promise<void>;
      toBeDisabled(options?: any): Promise<void>;
      toBeChecked(options?: any): Promise<void>;
      toHaveText(text: string | RegExp | Array<string | RegExp>, options?: any): Promise<void>;
      toHaveValue(value: string | RegExp, options?: any): Promise<void>;
      toHaveAttribute(name: string, value?: string | RegExp, options?: any): Promise<void>;
      toHaveClass(expected: string | RegExp | Array<string | RegExp>, options?: any): Promise<void>;
      toHaveCount(count: number, options?: any): Promise<void>;
      toHaveURL(url: string | RegExp, options?: any): Promise<void>;
      toHaveTitle(title: string | RegExp, options?: any): Promise<void>;
      toContainText(text: string | RegExp | Array<string | RegExp>, options?: any): Promise<void>;
      not: any;
      [key: string]: any;
    };
    [key: string]: any;
  }
  export const test: {
    (title: string, fn: (args: { page: Page; context: BrowserContext; browser: Browser }) => Promise<void>): void;
    describe(title: string, fn: () => void): void;
    beforeEach(fn: (args: { page: Page; context: BrowserContext }) => Promise<void>): void;
    afterEach(fn: (args: { page: Page; context: BrowserContext }) => Promise<void>): void;
    beforeAll(fn: () => Promise<void>): void;
    afterAll(fn: () => Promise<void>): void;
    skip(title: string, fn: (args: { page: Page }) => Promise<void>): void;
    only(title: string, fn: (args: { page: Page }) => Promise<void>): void;
    use(options: any): void;
    step(title: string, fn: () => Promise<void>): Promise<void>;
    [key: string]: any;
  };
  export const expect: Expect;
}`,
    "file:///node_modules/@playwright/test/index.d.ts",
  );
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-md border bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading editor...
      </div>
    </div>
  ),
});

function useAutoCompleteToolResult(
  status: { type: string },
  addResult: (result: { success: boolean }) => void,
) {
  const addResultRef = useRef(addResult);
  addResultRef.current = addResult;

  useEffect(() => {
    if (status.type === "requires-action") {
      addResultRef.current({ success: true });
    }
  }, [status.type]);
}

interface DryRunResult {
  status: "pass" | "fail" | "error";
  logs: string;
  errors: string;
  durationMs: number;
}

function TestCodeRenderer({
  name,
  code,
  loading,
}: {
  name: string;
  code: string;
  loading: boolean;
}) {
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  // Keep editedCode in sync while streaming
  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const handleDryRun = useCallback(async () => {
    setIsRunning(true);
    setDryRunResult(null);
    try {
      const res = await fetch("/api/synthetic-test/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editedCode }),
      });
      const result = await res.json();
      if (!res.ok) {
        setDryRunResult({
          status: "error",
          logs: "",
          errors: result.error || "Request failed",
          durationMs: 0,
        });
      } else {
        setDryRunResult(result);
      }
    } catch (err) {
      setDryRunResult({
        status: "error",
        logs: "",
        errors: err instanceof Error ? err.message : "Network error",
        durationMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [editedCode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedCode]);

  return (
    <div className="my-4 w-full overflow-hidden rounded-xl border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500" />
          <h3 className="font-semibold text-sm">{name || "Untitled Test"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="size-3" />
            ) : (
              <CopyIcon className="size-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 gap-1.5 px-3 text-xs"
            onClick={handleDryRun}
            disabled={isRunning || loading}
          >
            {isRunning ? (
              <LoaderIcon className="size-3 animate-spin" />
            ) : (
              <PlayIcon className="size-3" />
            )}
            {isRunning ? "Running..." : "Dry Run"}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height="400px"
        language="typescript"
        theme="vs-dark"
        value={editedCode}
        onChange={(value) => setEditedCode(value || "")}
        beforeMount={configureMonaco}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          readOnly: loading,
          padding: { top: 12 },
        }}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating test...
          </div>
        </div>
      )}

      {/* Dry Run Results */}
      {dryRunResult && (
        <div className="border-t">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2.5",
              dryRunResult.status === "pass" && "bg-emerald-500/10",
              dryRunResult.status === "fail" && "bg-red-500/10",
              dryRunResult.status === "error" && "bg-amber-500/10",
            )}
          >
            {dryRunResult.status === "pass" && (
              <CheckCircleIcon className="size-4 text-emerald-500" />
            )}
            {dryRunResult.status === "fail" && (
              <XCircleIcon className="size-4 text-red-500" />
            )}
            {dryRunResult.status === "error" && (
              <AlertTriangleIcon className="size-4 text-amber-500" />
            )}
            <span className="font-medium text-sm">
              {dryRunResult.status === "pass" && "Test Passed"}
              {dryRunResult.status === "fail" && "Test Failed"}
              {dryRunResult.status === "error" && "Execution Error"}
            </span>
            {dryRunResult.durationMs > 0 && (
              <span className="text-xs text-muted-foreground">
                ({(dryRunResult.durationMs / 1000).toFixed(1)}s)
              </span>
            )}
          </div>
          {(dryRunResult.logs || dryRunResult.errors) && (
            <div className="max-h-48 overflow-auto bg-zinc-950 px-4 py-3">
              {dryRunResult.logs && (
                <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                  {dryRunResult.logs}
                </pre>
              )}
              {dryRunResult.errors && (
                <pre className="font-mono text-xs text-red-400 whitespace-pre-wrap">
                  {dryRunResult.errors}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const TestRenderToolUI = makeAssistantToolUI<
  { name: string; code: string },
  { success: boolean }
>({
  toolName: "render_test",
  render: ({ args, status, addResult }) => {
    useAutoCompleteToolResult(status, addResult);

    const loading = status.type === "running";

    if (!args?.code) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Generating test...
          </div>
        </div>
      );
    }

    return (
      <TestCodeRenderer
        name={args.name || ""}
        code={args.code}
        loading={loading}
      />
    );
  },
});
