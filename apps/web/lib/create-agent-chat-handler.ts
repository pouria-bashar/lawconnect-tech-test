import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk"
import { RequestContext } from "@mastra/core/request-context";
import { MODEL_ID_KEY } from "@/lib/model-config";
import { mastra } from "@/mastra";

export function createAgentChatHandler(agentName: "leadAgent" | "blogAgent" | "syntheticTestAgent" | "immigrationResearchAgent") {
  return async function POST(req: Request) {
    const { messages, modelId } = await req.json();

    const agent = mastra.getAgent(agentName);

    const requestContext = new RequestContext();
    if (modelId) {
      requestContext.set(MODEL_ID_KEY, modelId);
    }

    const stream = await agent.stream(messages, { requestContext });

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
