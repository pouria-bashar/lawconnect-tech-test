"use client";

import { type WorkflowPhase } from "@/hooks/use-workflow-status";

type Phase = { id: WorkflowPhase; label: string };

const PHASES: Phase[] = [
  { id: "design", label: "Design" },
  { id: "planning", label: "Planning" },
  { id: "implementation", label: "Building" },
];

const PHASE_ORDER: WorkflowPhase[] = [
  "design",
  "design_suspended",
  "planning",
  "implementation",
  "completed",
];

function phaseIndex(phase: WorkflowPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

export function WorkflowPhaseBar({ phase }: { phase: WorkflowPhase }) {
  if (!phase) return null;

  const currentIdx = phaseIndex(phase);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 shrink-0">
      {PHASES.map((p, i) => {
        const stepPhaseIdx = phaseIndex(p.id);
        const done =
          currentIdx >
          (p.id === "design"
            ? phaseIndex("design_suspended")
            : stepPhaseIdx);
        const active =
          p.id === "design"
            ? currentIdx <= phaseIndex("design_suspended")
            : currentIdx === stepPhaseIdx ||
              (p.id === "implementation" && phase === "completed");
        const pending = !done && !active;

        return (
          <div key={p.id} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-muted-foreground/40 text-xs mx-1">→</span>
            )}
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                done
                  ? "bg-primary/10 text-primary"
                  : active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground/50"
              }`}
            >
              {done && <span>✓</span>}
              {active && !done && (
                <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
              )}
              {pending && (
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
              {p.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
