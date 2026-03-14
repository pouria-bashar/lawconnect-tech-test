import { createAgentChatHandler } from "@/lib/create-agent-chat-handler";

export const maxDuration = 60;

const handler = createAgentChatHandler("codingAgent");
export const POST = handler.POST;
export const GET = handler.GET;
