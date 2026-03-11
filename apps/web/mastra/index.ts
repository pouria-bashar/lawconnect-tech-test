import { Mastra } from "@mastra/core";
import { chefAgent } from "./agents/chefAgent";
import { pdfAgent } from "./agents/pdfAgent";

export const mastra = new Mastra({
  agents: { chefAgent, pdfAgent },
});
