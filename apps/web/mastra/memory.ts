import { Memory } from "@mastra/memory";

export const sharedMemory = new Memory({
  options: { generateTitle: true, lastMessages: 20 },
});
