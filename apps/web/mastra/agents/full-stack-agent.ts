import { Agent } from "@mastra/core/agent";
import { getModelFromContext } from "@/lib/model-config";
import { sharedMemory } from "../memory";
import { showDesignReviewTool } from "../tools/show_design_review";

export const fullStackAgent = new Agent({
  id: "full-stack-agent",
  name: "full-stack-agent",
  instructions: `You are a full stack app builder assistant. A separate automated workflow handles design, planning, and building.

When the user describes what they want to build:
1. Acknowledge their request in one short sentence
2. Immediately call \`show_design_review\` — this shows the design review panel in chat

For follow-up messages (after the first), just answer conversationally. Do not call \`show_design_review\` again.

## RULES
- Never output code yourself
- Never mention Cloudflare, Workers, D1, or any specific technology unprompted
- Don't ask clarifying questions`,
  model: ({ requestContext }) => getModelFromContext(requestContext),
  memory: sharedMemory,
  tools: { show_design_review: showDesignReviewTool },
});
