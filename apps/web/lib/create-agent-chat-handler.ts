import { handleChatStream } from "@mastra/ai-sdk";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import { NextResponse } from "next/server";
import { RequestContext } from "@mastra/core/request-context";
import { MODEL_ID_KEY } from "@/lib/model-config";
import { getUserId } from "@/lib/get-user-id";

export type AgentName =
  | "leadAgent"
  | "blogAgent"
  | "syntheticTestAgent"
  | "immigrationResearchAgent"
  | "fullStackAgent"
  | "codingAgent"

export function createAgentChatHandler(agentName: AgentName) {
  return {
    POST: async (req: Request): Promise<Response> => {
      const params = await req.json();
      const { threadId, modelId, themeId } = params;

      if (!threadId) {
        return new Response("threadId is required", { status: 400 });
      }

      const userId = await getUserId();
      const resourceId = `${userId}:${agentName}`;

      const requestContext = new RequestContext();
      if (modelId) requestContext.set(MODEL_ID_KEY, modelId);
      if (themeId) requestContext.set("themeId", themeId);

      const stream = await handleChatStream({
        mastra,
        agentId: agentName,
        params: {
          messages: params.messages,
          requestContext,
          memory: {
            thread: threadId,
            resource: resourceId,
          },
        },
      });
      // @ts-expect-error - @mastra/ai-sdk FinishReason includes 'unknown' which ai@6 FinishReason does not
      return createUIMessageStreamResponse({ stream });
    },
    GET: async (req: Request): Promise<Response> => {
      const { searchParams } = new URL(req.url);
      const threadId = searchParams.get("threadId") ?? "";

      const userId = await getUserId();
      const resourceId = `${userId}:${agentName}`;

      const memory = await mastra.getAgent(agentName).getMemory();
      let response = null;
      try {
        response = await memory?.recall({ threadId, resourceId });
      } catch {
        /* no previous messages */
      }

      const uiMessages = toAISdkV5Messages(response?.messages || []);
      return NextResponse.json(uiMessages);
    },
  };
}
