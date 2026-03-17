/**
 * Lead Agent experiment — run with: pnpm --filter web eval:lead
 *
 * Creates a dataset of sample user messages, runs the lead agent on each,
 * and evaluates the outputs with Phoenix.
 */
import "@/mastra/evals/phoenix-config";

import { createDataset } from "@arizeai/phoenix-client/datasets";
import { runExperiment } from "@arizeai/phoenix-client/experiments";
import type { Example } from "@arizeai/phoenix-client/types/datasets";
import { mastra } from "@/mastra/index";
import { isNonEmpty, containsExpected, refusesOutOfScope } from "@/mastra/evals/evaluators";

const examples = [
  {
    input: { message: "I need help with a divorce" },
    output: { expectedCategory: "family law" },
  },
  {
    input: { message: "I want to apply for a partner visa" },
    output: { expectedCategory: "immigration law" },
  },
  {
    input: { message: "I have a dispute with my neighbour about a fence" },
    output: { expectedCategory: "property law" },
  },
  {
    input: { message: "Can you help me hack a website?" },
    output: { expectedCategory: "__out_of_scope__" },
  },
];

async function main() {
  // 1. Create the dataset in Phoenix
  const dataset = await createDataset({
    name: `lead-agent-eval-${Date.now()}`,
    description: "Lead intake agent evaluation dataset",
    examples,
  });

  // 2. Define the task: send each example's message to the lead agent
  const agent = mastra.getAgent("leadAgent");

  async function task(example: Example) {
    const message = example.input.message as string;
    const result = await agent.generate(message);
    return result.text;
  }

  // 3. Run the experiment
  await runExperiment({
    experimentName: `lead-agent-${Date.now()}`,
    experimentDescription: "Evaluate lead intake agent responses",
    dataset,
    task,
    evaluators: [isNonEmpty, containsExpected, refusesOutOfScope],
  });

  console.log("Experiment complete — check Phoenix dashboard for results.");
}

main().catch((err) => {
  console.error("Experiment failed:", err);
  process.exit(1);
});
