export const DEFAULT_MODEL = "google/gemini-2.5-flash";
export const MODEL_ID_KEY = "model-id";

export const MODEL_OPTIONS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "anthropic/claude-opus-4-6", label: "Claude Opus 4.6" },
  { value: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5" },
] as const

export function getModelFromContext(requestContext?: { get: (key: string) => unknown }): string {
  const modelId = requestContext?.get(MODEL_ID_KEY);
  return typeof modelId === "string" ? modelId : DEFAULT_MODEL;
}
