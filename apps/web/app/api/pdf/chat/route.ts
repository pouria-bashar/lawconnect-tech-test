import { createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";
import { mastra } from "@/mastra";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent("pdfAgent");

  const stream = await agent.stream(messages);

  return createUIMessageStreamResponse({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: toAISdkStream(stream, { from: "agent" }) as any,
  });
}
