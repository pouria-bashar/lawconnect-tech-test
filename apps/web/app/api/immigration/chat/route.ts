import { createAgentChatHandler } from "@/lib/create-agent-chat-handler";

export const maxDuration = 30;

const handler = createAgentChatHandler("immigrationResearchAgent");
export const POST = handler.POST;
export const GET = handler.GET;
