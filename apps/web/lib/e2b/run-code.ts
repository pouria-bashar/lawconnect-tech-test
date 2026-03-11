import { getSandbox } from "./sandbox";

export interface RunResult {
  status: "pass" | "fail" | "error";
  logs: string;
  errors: string;
  durationMs: number;
}

export async function runCode(code: string): Promise<RunResult> {
  const start = Date.now();
  const sbx = await getSandbox();

  // Write test file to sandbox
  await sbx.files.write("/home/user/test.spec.ts", code);

  try {
    // Install Playwright test runner
    await sbx.commands.run("npm install @playwright/test", {
      timeoutMs: 60_000,
    });

    // Run the test
    const result = await sbx.commands.run(
      "npx playwright test /home/user/test.spec.ts --reporter=list",
      { timeoutMs: 60_000 },
    );

    const durationMs = Date.now() - start;

    return {
      status: result.exitCode === 0 ? "pass" : "fail",
      logs: result.stdout,
      errors: result.stderr,
      durationMs,
    };
  } catch (error: unknown) {
    const durationMs = Date.now() - start;
    const err = error as { stdout?: string; stderr?: string; message?: string };

    return {
      status: "error",
      logs: err.stdout || "",
      errors: err.stderr || err.message || "Unknown error",
      durationMs,
    };
  }
}
