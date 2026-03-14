import { createAgentChatHandler } from "@/lib/create-agent-chat-handler";

export const maxDuration = 30;

const handler = createAgentChatHandler("blogAgent");
export const POST = handler.POST;
export const GET = handler.GET;
