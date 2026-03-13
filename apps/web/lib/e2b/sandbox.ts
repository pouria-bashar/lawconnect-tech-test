import { Sandbox } from "e2b";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export async function getSandbox(): Promise<Sandbox> {
  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) {
    throw new Error("E2B_API_KEY environment variable is required");
  }

  const timeout = parseInt(
    process.env.E2B_SANDBOX_TIMEOUT || String(FIFTEEN_MINUTES),
    10,
  );
  const template = process.env.E2B_TEMPLATE || "ui-generator-template";
  const sandboxId = process.env.E2B_SANDBOX_ID || "ui-generator";

  // Find existing sandbox by metadata
  const paginator = await Sandbox.list({
    apiKey,
    query: {
      metadata: { id: sandboxId },
    },
  });
  const sandboxes = await paginator.nextItems();
  const existing = sandboxes?.[0];

  if (existing) {
    try {
      return await Sandbox.connect(existing.sandboxId, { apiKey });
    } catch {
      // Sandbox expired or unreachable, create a new one
    }
  }

  return await Sandbox.create(template, {
    apiKey,
    timeoutMs: timeout,
    metadata: { id: sandboxId },
    envs: {
      GEMINI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN!,
    },
  })
}
