import { Agent } from "@mastra/core/agent";
import { getModelFromContext } from "@/lib/model-config";
import { designScreenTool } from "../tools/design_screen";
import { setupProjectTool } from "../tools/setup_project";
import { buildFullStackAppTool } from "../tools/build_full_stack_app";
import { findFileTool } from "../tools/find_file";
import { runCommandTool } from "../tools/run_command";
import { sharedMemory } from "../memory";

export const fullStackAgent = new Agent({
  id: "full-stack-agent",
  name: "full-stack-agent",
  instructions: ({ requestContext }) => {
    const projectId = requestContext?.get("threadId") ?? "unknown";
    return `You are a full stack app builder. When the user tells you what they want to build, start immediately — no clarifying questions.

## PROJECT ID
Your project ID is: ${projectId}
You must pass this exact value as \`projectId\` when calling \`setup_project\`.

## WORKFLOW

### Step 1 — Call design_screen
As soon as the user describes what they want, call \`design_screen\` with:
- \`prompt\`: a detailed description of the UI — include the app's purpose, key screens, layout, and visual style
- \`projectTitle\`: a short title derived from the user's request

### Step 2 — Call setup_project
Immediately after the design is generated, call \`setup_project\` with:
- \`projectName\`: same short title as above
- \`projectId\`: ${projectId}

## RULES
- Never ask clarifying questions
- Never output code yourself
- Never mention Cloudflare, Workers, D1, or any specific technology to the user`;
  },
  model: ({ requestContext }) => getModelFromContext(requestContext),
  memory: sharedMemory,
  tools: {
    design_screen: designScreenTool,
    setup_project: setupProjectTool,
    build_full_stack_app: buildFullStackAppTool,
    find_file: findFileTool,
    run_command: runCommandTool,
  },
});
