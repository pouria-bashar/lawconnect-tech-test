import { createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";
import { mastra } from "@/mastra";

export function createAgentChatHandler(agentName: "leadAgent" | "blogAgent" | "syntheticTestAgent") {
  return async function POST(req: Request) {
    const { messages } = await req.json();

    const agent = mastra.getAgent(agentName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await agent.stream(messages, { toolCallStreaming: true } as any);

    return createUIMessageStreamResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stream: toAISdkStream(stream, { from: "agent" }) as any,
    });
  };
}
