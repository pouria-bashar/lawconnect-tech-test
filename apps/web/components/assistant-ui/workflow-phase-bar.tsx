"use client";

import { type WorkflowPhase } from "@/hooks/use-workflow-status";

export type ViewPhase = "setup" | "design" | "planning" | "implementation";

type Phase = { id: ViewPhase; label: string };

const PHASES: Phase[] = [
  { id: "setup", label: "Setup" },
  { id: "design", label: "Design" },
  { id: "planning", label: "Planning" },
  { id: "implementation", label: "Building" },
];

const PHASE_ORDER: WorkflowPhase[] = [
  "setup",
  "design",
  "design_suspended",
  "planning",
  "implementation",
  "completed",
];

function phaseIndex(phase: WorkflowPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

interface WorkflowPhaseBarProps {
  phase: WorkflowPhase;
  viewingPhase?: ViewPhase | null;
  onPhaseClick?: (phase: ViewPhase) => void;
}

export function WorkflowPhaseBar({ phase, viewingPhase, onPhaseClick }: WorkflowPhaseBarProps) {
  if (!phase) return null;

  const currentIdx = phaseIndex(phase);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 shrink-0">
      {PHASES.map((p, i) => {
        const stepPhaseIdx = phaseIndex(p.id);
        const done =
          currentIdx >
          (p.id === "design" ? phaseIndex("design_suspended") : stepPhaseIdx);
        const active =
          p.id === "design"
            ? currentIdx >= phaseIndex("design") && currentIdx <= phaseIndex("design_suspended")
            : currentIdx === stepPhaseIdx ||
              (p.id === "implementation" && phase === "completed");
        const pending = !done && !active;
        const viewing = viewingPhase === p.id;
        const clickable = (done || active) && !!onPhaseClick;

        return (
          <div key={p.id} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-muted-foreground/40 text-xs mx-1">→</span>
            )}
            <button
              disabled={pending || !clickable}
              onClick={() => clickable && onPhaseClick(p.id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                pending
                  ? "text-muted-foreground/50 cursor-default"
                  : viewing
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      : "bg-primary text-primary-foreground cursor-pointer"
              }`}
            >
              {done && !viewing && <span>✓</span>}
              {active && !done && (
                <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
              )}
              {pending && (
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
              {p.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
