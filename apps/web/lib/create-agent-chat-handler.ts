import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk"
import { mastra } from "@/mastra";

export function createAgentChatHandler(agentName: "leadAgent" | "blogAgent" | "syntheticTestAgent") {
  return async function POST(req: Request) {
    const { messages } = await req.json();

    const agent = mastra.getAgent(agentName);

    const stream = await agent.stream(messages);

    const uiMessageStream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        for await (const part of toAISdkStream(stream, { from: "agent" })) {
          // @ts-expect-error - @mastra/ai-sdk FinishReason includes 'unknown' which ai@6 FinishReason does not
          await writer.write(part);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: uiMessageStream,
    });
  };
}
