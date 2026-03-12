"use client";

import { useState } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { useThreadRuntime } from "@assistant-ui/react";
import { cn } from "@workspace/ui/lib/utils";
import { addIntakeEntry } from "@/lib/intake-store";

type Option = { label: string; value: string };

export const AskQuestionToolUI = makeAssistantToolUI<
  {
    question: string;
    type: "radio" | "checkbox";
    options: Option[];
    allowOther?: boolean;
  },
  { answers: string[]; otherText?: string }
>({
  toolName: "ask_question",
  render: ({ args, status, addResult }) => {
    const runtime = useThreadRuntime();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [otherText, setOtherText] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const loading = status.type === "running";
    const question = args?.question;
    const type = args?.type ?? "radio";
    const options = args?.options;
    const allowOther = args?.allowOther ?? false;

    if (!question || !options?.length) {
      if (!loading) return null;
      return (
        <div className="my-4 rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Preparing question...
          </div>
        </div>
      );
    }

    function toggleOption(value: string) {
      if (submitted) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (type === "radio") {
          next.clear();
          next.add(value);
        } else {
          if (next.has(value)) next.delete(value);
          else next.add(value);
        }
        return next;
      });
    }

    function handleSubmit() {
      if (selected.size === 0) return;
      setSubmitted(true);

      const answers = Array.from(selected);
      const selectedLabels = options!
        .filter((o) => selected.has(o.value))
        .map((o) => o.label);
      if (selected.has("other") && otherText) {
        selectedLabels.push(otherText);
      }

      // Capture Q&A for lead save
      addIntakeEntry({
        question: question!,
        answers: selectedLabels,
        ...(selected.has("other") && otherText ? { otherText } : {}),
      });

      // Complete the tool call
      addResult({
        answers,
        ...(selected.has("other") && otherText ? { otherText } : {}),
      });

      // Append a user message to start a new turn (avoids multi-step accumulation)
      setTimeout(() => {
        runtime.append({
          role: "user",
          content: [{ type: "text", text: selectedLabels.join(", ") }],
        });
      }, 0);
    }

    // Show compact summary after submission
    if (submitted) {
      const selectedLabels = options
        .filter((o) => selected.has(o.value))
        .map((o) => o.label);
      if (selected.has("other") && otherText) {
        selectedLabels.push(`Other: ${otherText}`);
      }

      return (
        <div className="my-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                <svg
                  className="mr-1.5 size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="my-4 space-y-3">
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                {type === "radio" ? (
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="size-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                )}
                <span>{option.label}</span>
              </button>
            );
          })}

          {allowOther && (
            <button
              type="button"
              onClick={() => toggleOption("other")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                selected.has("other")
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              {type === "radio" ? (
                <div
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    selected.has("other")
                      ? "border-primary"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selected.has("other") && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    selected.has("other")
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selected.has("other") && (
                    <svg
                      className="size-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              )}
              <span>Other</span>
            </button>
          )}

          {allowOther && selected.has("other") && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Please specify..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            selected.size === 0 ||
            (selected.has("other") && allowOther && !otherText.trim())
          }
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    );
  },
});
