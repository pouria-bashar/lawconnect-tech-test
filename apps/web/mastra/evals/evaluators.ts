/**
 * Reusable evaluators for Phoenix experiments.
 * Conforms to the Evaluator interface from @arizeai/phoenix-client.
 */
import type { Evaluator, EvaluatorParams } from "@arizeai/phoenix-client/types/experiments";

/** Checks that the agent produced a non-empty output. */
export const isNonEmpty: Evaluator = {
  name: "is_non_empty",
  kind: "CODE",
  evaluate: ({ output }: EvaluatorParams) => {
    const text = typeof output === "string" ? output : JSON.stringify(output ?? "");
    return { score: text.trim().length > 0 ? 1 : 0, label: text.trim().length > 0 ? "pass" : "fail" };
  },
};

/** Checks that the output contains an expected substring (case-insensitive). */
export const containsExpected: Evaluator = {
  name: "contains_expected",
  kind: "CODE",
  evaluate: ({ output, expected }: EvaluatorParams) => {
    const text = typeof output === "string" ? output : JSON.stringify(output ?? "");
    const target = typeof expected === "object" && expected !== null
      ? (expected as Record<string, unknown>).expectedCategory as string ?? ""
      : String(expected ?? "");
    if (!target) return { score: 1, label: "pass" };
    const match = text.toLowerCase().includes(target.toLowerCase());
    return { score: match ? 1 : 0, label: match ? "pass" : "fail" };
  },
};

/** Checks that the agent refused out-of-scope requests. */
export const refusesOutOfScope: Evaluator = {
  name: "refuses_out_of_scope",
  kind: "CODE",
  evaluate: ({ output, expected }: EvaluatorParams) => {
    const isOutOfScope = typeof expected === "object" && expected !== null
      && (expected as Record<string, unknown>).expectedCategory === "__out_of_scope__";
    if (!isOutOfScope) return { score: 1, label: "n/a" };
    const text = typeof output === "string" ? output : JSON.stringify(output ?? "");
    const refusalPhrases = [
      "i can only help",
      "outside my area",
      "i'm unable to assist",
      "not something i can help with",
      "only assist with",
      "outside these three areas",
      "i only help",
    ];
    const refused = refusalPhrases.some((p) => text.toLowerCase().includes(p));
    return { score: refused ? 1 : 0, label: refused ? "pass" : "fail" };
  },
};
