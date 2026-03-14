"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  SaveIcon,
  ArrowLeftIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";

function configureMonaco(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    moduleResolution:
      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    noEmit: true,
  });

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
    <div className="flex h-[500px] items-center justify-center rounded-md border bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading editor...
      </div>
    </div>
  ),
});

interface TestData {
  id: string;
  name: string;
  description: string | null;
  code: string;
  cron: string | null;
  paused: string;
  createdAt: string;
  updatedAt: string;
}

interface RunResult {
  status: "pass" | "fail" | "error";
  logs: string;
  errors: string;
  durationMs: number;
  reportId: string;
}

interface TestReport {
  id: string;
  testId: string;
  status: string;
  logs: string | null;
  errors: string | null;
  durationMs: number | null;
  triggerType: string;
  createdAt: string;
}

export default function SyntheticTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editedCode, setEditedCode] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const saveMessageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const codeInitialized = useRef(false);

  const {
    data: test = null,
    isLoading: loading,
    error: testError,
  } = useQuery<TestData | null>({
    queryKey: queryKeys.syntheticTest.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/synthetic-test/${id}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Test not found" : "Failed to load test");
      }
      return res.json();
    },
  });

  // Initialize editedCode from fetched test data only once
  useEffect(() => {
    if (test?.code && !codeInitialized.current) {
      setEditedCode(test.code);
      codeInitialized.current = true;
    }
  }, [test?.code]);

  // Clean up save message timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveMessageTimer.current);
  }, []);

  const error = testError ? testError.message : null;

  const {
    data: reports = [],
    isLoading: reportsLoading,
    isFetching: reportsRefreshing,
  } = useQuery<TestReport[]>({
    queryKey: queryKeys.syntheticTest.reports(id),
    queryFn: async () => {
      const res = await fetch(`/api/synthetic-test/${id}/reports`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleRefreshReports = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.syntheticTest.reports(id) });
  }, [queryClient, id]);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || "";
      setEditedCode(newCode);
      setIsDirty(newCode !== test?.code);
    },
    [test?.code],
  );

  const saveMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/synthetic-test/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.syntheticTest.detail(id), updated);
      setIsDirty(false);
      setSaveMessage("Saved");
      clearTimeout(saveMessageTimer.current);
      saveMessageTimer.current = setTimeout(() => setSaveMessage(null), 2000);
    },
    onError: () => {
      setSaveMessage("Failed to save");
    },
  });

  const saving = saveMutation.isPending;

  const handleSave = useCallback(async () => {
    if (!test) return;
    setSaveMessage(null);
    saveMutation.mutate(editedCode);
  }, [test, editedCode, saveMutation]);

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/synthetic-test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        return {
          status: "error" as const,
          logs: "",
          errors: result.error || "Request failed",
          durationMs: 0,
          reportId: "",
        };
      }
      return result as RunResult;
    },
    onSuccess: (result) => {
      setRunResult(result);
      queryClient.invalidateQueries({ queryKey: queryKeys.syntheticTest.reports(id) });
    },
    onError: (err) => {
      setRunResult({
        status: "error",
        logs: "",
        errors: err instanceof Error ? err.message : "Network error",
        durationMs: 0,
        reportId: "",
      });
    },
  });

  const isRunning = runMutation.isPending;

  const handleRun = useCallback(async () => {
    setRunResult(null);
    runMutation.mutate();
  }, [runMutation]);

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-3rem)] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading test...
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex h-[calc(100dvh-3rem)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Test not found"}</p>
        <Link href="/synthetic-test">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeftIcon className="size-3" />
            Back to generator
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/synthetic-test"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            Back to generator
          </Link>
          <h1 className="font-bold text-2xl tracking-tight">{test.name}</h1>
          {test.description && (
            <p className="mt-1 text-muted-foreground text-sm">{test.description}</p>
          )}
          {test.cron && (
            <p className="mt-1 font-mono text-muted-foreground text-xs">
              Schedule: {test.cron}
            </p>
          )}
        </div>
      </div>

      {/* Editor card */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-sm">test.spec.ts</span>
            {isDirty && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">
                unsaved
              </span>
            )}
            {saveMessage && (
              <span className="text-xs text-emerald-600">{saveMessage}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-3 text-xs"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? (
                <LoaderIcon className="size-3 animate-spin" />
              ) : (
                <SaveIcon className="size-3" />
              )}
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 gap-1.5 px-3 text-xs"
              onClick={handleRun}
              disabled={isRunning || isDirty}
              title={isDirty ? "Save changes before running" : "Run test"}
            >
              {isRunning ? (
                <LoaderIcon className="size-3 animate-spin" />
              ) : (
                <PlayIcon className="size-3" />
              )}
              {isRunning ? "Running..." : "Run Test"}
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <MonacoEditor
          height="500px"
          language="typescript"
          theme="vs-dark"
          value={editedCode}
          onChange={handleCodeChange}
          beforeMount={configureMonaco}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12 },
          }}
        />

        {/* Run Results */}
        {runResult && (
          <div className="border-t">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2.5",
                runResult.status === "pass" && "bg-emerald-500/10",
                runResult.status === "fail" && "bg-red-500/10",
                runResult.status === "error" && "bg-amber-500/10",
              )}
            >
              {runResult.status === "pass" && (
                <CheckCircleIcon className="size-4 text-emerald-500" />
              )}
              {runResult.status === "fail" && (
                <XCircleIcon className="size-4 text-red-500" />
              )}
              {runResult.status === "error" && (
                <AlertTriangleIcon className="size-4 text-amber-500" />
              )}
              <span className="font-medium text-sm">
                {runResult.status === "pass" && "Test Passed"}
                {runResult.status === "fail" && "Test Failed"}
                {runResult.status === "error" && "Execution Error"}
              </span>
              {runResult.durationMs > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({(runResult.durationMs / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
            {(runResult.logs || runResult.errors) && (
              <div className="max-h-48 overflow-auto bg-zinc-950 px-4 py-3">
                {runResult.logs && (
                  <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                    {runResult.logs}
                  </pre>
                )}
                {runResult.errors && (
                  <pre className="font-mono text-xs text-red-400 whitespace-pre-wrap">
                    {runResult.errors}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Reports */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-semibold text-lg">Test Reports</h2>
          <button
            type="button"
            onClick={handleRefreshReports}
            disabled={reportsRefreshing}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="Refresh reports"
          >
            <RefreshCwIcon className={cn("size-4", reportsRefreshing && "animate-spin")} />
          </button>
        </div>
        {reportsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reports yet. Run the test to generate the first report.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px_120px_140px] gap-2 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground">
              <span>Time</span>
              <span>Status</span>
              <span>Trigger</span>
              <span>Duration</span>
              <span>Details</span>
            </div>
            {reports.map((report) => (
              <div key={report.id} className="border-b last:border-b-0">
                <div className="grid grid-cols-[1fr_100px_100px_120px_140px] items-center gap-2 px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ClockIcon className="size-3" />
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {report.status === "pass" && (
                      <CheckCircleIcon className="size-3.5 text-emerald-500" />
                    )}
                    {report.status === "fail" && (
                      <XCircleIcon className="size-3.5 text-red-500" />
                    )}
                    {report.status === "error" && (
                      <AlertTriangleIcon className="size-3.5 text-amber-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        report.status === "pass" && "text-emerald-600",
                        report.status === "fail" && "text-red-600",
                        report.status === "error" && "text-amber-600",
                      )}
                    >
                      {report.status}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {report.triggerType}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {report.durationMs != null
                      ? `${(report.durationMs / 1000).toFixed(1)}s`
                      : "—"}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setExpandedReport(
                        expandedReport === report.id ? null : report.id,
                      )
                    }
                  >
                    {expandedReport === report.id ? (
                      <ChevronDownIcon className="size-3.5" />
                    ) : (
                      <ChevronRightIcon className="size-3.5" />
                    )}
                    {expandedReport === report.id ? "Hide" : "Show"} logs
                  </button>
                </div>
                {expandedReport === report.id &&
                  (report.logs || report.errors) && (
                    <div className="max-h-48 overflow-auto bg-zinc-950 px-4 py-3">
                      {report.logs && (
                        <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                          {report.logs}
                        </pre>
                      )}
                      {report.errors && (
                        <pre className="mt-2 font-mono text-xs text-red-400 whitespace-pre-wrap">
                          {report.errors}
                        </pre>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
