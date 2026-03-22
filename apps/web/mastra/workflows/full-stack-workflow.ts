import { createStep, createWorkflow } from "@mastra/core/workflows";
import { stitch } from "@google/stitch-sdk";
import { z } from "zod";
import { saveStitchProject } from "@workspace/db/queries/fullstack-apps";
import { getSandbox } from "@workspace/e2b/sandbox";
import { startClaudeCode } from "@workspace/e2b/run-claude-code";
import { createBuildJob } from "@workspace/db/queries/build-jobs";
import { designAgent } from "../agents/design-agent";
import { planningAgent } from "../agents/planning-agent";
import { toSlug } from "../tools/setup_project";

// ─── Step 0: Setup ───────────────────────────────────────────────────────────
// Warms up the E2B sandbox and scaffolds the project boilerplate.

const setupStep = createStep({
  id: "setup",
  inputSchema: z.object({
    projectId: z.string(),
    prompt: z.string(),
    projectTitle: z.string(),
  }),
  outputSchema: z.object({
    projectId: z.string(),
    prompt: z.string(),
    projectTitle: z.string(),
    projectDir: z.string(),
  }),
  execute: async ({ inputData }) => {
    const slug = toSlug(inputData.projectTitle);
    const projectDir = `/home/user/${slug}`;
    const sbx = await getSandbox(inputData.projectId);

    await sbx.commands.run(
      `npx github:aibuilder-ai/siu-boilerplate ${slug} -t nextjs-hono-worker --yes --no-git --no-install`,
      { cwd: "/home/user", timeoutMs: 5 * 60 * 1000 },
    );

    return { projectId: inputData.projectId, prompt: inputData.prompt, projectTitle: inputData.projectTitle, projectDir };
  },
});

// ─── Step 1: Design ──────────────────────────────────────────────────────────
// Generates initial Stitch design, then suspends in a loop until user approves.
// On each resume the user can: edit a screen, generate variants, or approve.

const designStep = createStep({
  id: "design",
  inputSchema: z.object({
    projectId: z.string(),
    prompt: z.string(),
    projectTitle: z.string(),
    projectDir: z.string(),
  }),
  resumeSchema: z.object({
    action: z.enum(["approve", "edit", "variants"]),
    feedback: z.string().optional(),
    variantPrompt: z.string().optional(),
    screenId: z.string().optional(),
  }),
  suspendSchema: z.object({
    stitchProjectId: z.string(),
  }),
  outputSchema: z.object({
    stitchProjectId: z.string(),
    projectId: z.string(),
    prompt: z.string(),
    projectDir: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, suspendData }) => {
    if (!resumeData) {
      const project = await stitch.createProject(inputData.projectTitle);

      await saveStitchProject({
        projectId: inputData.projectId,
        stitchProjectId: project.id,
        title: inputData.projectTitle,
      });

      const designResult = await designAgent.generate([
        { role: "user", content: `App description: ${inputData.prompt}` },
      ]);

      project.generate(`${inputData.prompt}\n\n${designResult.text}`, "DESKTOP");

      return await suspend({ stitchProjectId: project.id });
    }

    // Resumed — handle user action
    const { stitchProjectId } = suspendData!;
    const { action, feedback, screenId, variantPrompt } = resumeData;

    if (action === "edit" && screenId && feedback) {
      const project = stitch.project(stitchProjectId);
      const screen = await project.getScreen(screenId);
      screen
        .edit(feedback)
        .catch((err: Error) => console.error("design step: edit failed", err));
      return await suspend({ stitchProjectId });
    }

    if (action === "variants" && screenId && variantPrompt) {
      const project = stitch.project(stitchProjectId);
      const screen = await project.getScreen(screenId);
      screen
        .variants(variantPrompt, { variantCount: 3 })
        .catch((err: Error) => console.error("design step: variants failed", err));
      return await suspend({ stitchProjectId });
    }

    // action === "approve" — exit design loop
    return {
      stitchProjectId,
      projectId: inputData.projectId,
      prompt: inputData.prompt,
      projectDir: inputData.projectDir,
    };
  },
});

// ─── Step 2: Planning ────────────────────────────────────────────────────────
// Generates a detailed technical implementation plan.

const planningStep = createStep({
  id: "planning",
  inputSchema: z.object({
    stitchProjectId: z.string(),
    projectId: z.string(),
    prompt: z.string(),
    projectDir: z.string(),
  }),
  outputSchema: z.object({
    plan: z.string(),
    projectId: z.string(),
    projectDir: z.string(),
  }),
  execute: async ({ inputData }) => {
    const result = await planningAgent.generate([
      { role: "user", content: `App description: ${inputData.prompt}` },
    ]);

    return { plan: result.text, projectId: inputData.projectId, projectDir: inputData.projectDir };
  },
});

// ─── Step 3: Implementation ───────────────────────────────────────────────────
// Warms up the E2B sandbox and kicks off Claude Code to build the app.

const implementationStep = createStep({
  id: "implementation",
  inputSchema: z.object({
    plan: z.string(),
    projectId: z.string(),
    projectDir: z.string(),
  }),
  outputSchema: z.object({
    jobId: z.string(),
  }),
  execute: async ({ inputData }) => {
    const instructions = `${inputData.plan}\n\nBuild this app now.`;
    const { pid, sandboxId } = await startClaudeCode(instructions, inputData.projectId, inputData.projectDir);

    const job = await createBuildJob({ pid, sandboxId });

    return { jobId: job.id };
  },
});

// ─── Workflow ────────────────────────────────────────────────────────────────

export const fullStackWorkflow = createWorkflow({
  id: "fullStackWorkflow",
  inputSchema: z.object({
    projectId: z.string(),
    prompt: z.string(),
    projectTitle: z.string(),
  }),
  outputSchema: z.object({
    jobId: z.string(),
  }),
})
  .then(setupStep)
  .then(designStep)
  .then(planningStep)
  .then(implementationStep)
  .commit();

export { designStep };
