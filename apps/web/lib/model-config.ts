export const DEFAULT_MODEL = "google/gemini-2.5-flash";
export const MODEL_ID_KEY = "model-id";

export const MODEL_OPTIONS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "openai/gpt-5", label: "GPT-5" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "anthropic/claude-opus-4-6", label: "Claude Opus 4.6" },
  { value: "anthropic/claude-sonnet-4-5-20250514", label: "Claude Sonnet 4.5" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
] as const;

export function getModelFromContext(requestContext?: { get: (key: string) => unknown }): string {
  const modelId = requestContext?.get(MODEL_ID_KEY);
  return typeof modelId === "string" ? modelId : DEFAULT_MODEL;
}
