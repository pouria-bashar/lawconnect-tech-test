"use client";

import { useEffect, useState } from "react";

type StepConfig = {
  eyebrow: string;
  titleStart: string;
  titleItalic: string;
  stages: { label: string; pct: number }[];
  swatchColors: string[];
  accentColor: string;
  accentFaded: string;
};

const CONFIGS: Record<string, StepConfig> = {
  design: {
    eyebrow: "Design Phase",
    titleStart: "Building your",
    titleItalic: "vision",
    stages: [
      { label: "Sketching wireframes...", pct: 12 },
      { label: "Laying out the grid...", pct: 28 },
      { label: "Composing sections...", pct: 44 },
      { label: "Selecting palette...", pct: 60 },
      { label: "Refining typography...", pct: 74 },
      { label: "Polishing details...", pct: 88 },
      { label: "Almost ready...", pct: 97 },
    ],
    swatchColors: ["#f5a623", "#e8e0d4", "#c0b89a", "#3d3d3d", "#1a1a1a", "#fff8ed", "#7c6e5a"],
    accentColor: "#f5a623",
    accentFaded: "rgba(245,166,35,0.3)",
  },
  planning: {
    eyebrow: "Planning Phase",
    titleStart: "Architecting your",
    titleItalic: "app",
    stages: [
      { label: "Analysing requirements...", pct: 10 },
      { label: "Defining data models...", pct: 25 },
      { label: "Planning API routes...", pct: 42 },
      { label: "Scoping features...", pct: 58 },
      { label: "Ordering tasks...", pct: 74 },
      { label: "Writing specs...", pct: 89 },
      { label: "Finalising plan...", pct: 97 },
    ],
    swatchColors: ["#4a90d9", "#7bb3e8", "#2c5f8a", "#1a3a57", "#0d2236", "#c8dff5", "#5e8fc2"],
    accentColor: "#4a90d9",
    accentFaded: "rgba(74,144,217,0.3)",
  },
  implementation: {
    eyebrow: "Building Phase",
    titleStart: "Writing your",
    titleItalic: "code",
    stages: [
      { label: "Scaffolding project...", pct: 8 },
      { label: "Setting up dependencies...", pct: 22 },
      { label: "Building components...", pct: 40 },
      { label: "Wiring up the API...", pct: 57 },
      { label: "Connecting database...", pct: 73 },
      { label: "Running checks...", pct: 88 },
      { label: "Almost done...", pct: 97 },
    ],
    swatchColors: ["#50fa7b", "#bd93f9", "#ff79c6", "#ffb86c", "#8be9fd", "#f1fa8c", "#44475a"],
    accentColor: "#50fa7b",
    accentFaded: "rgba(80,250,123,0.3)",
  },
};

interface WorkflowStepLoaderProps {
  step: "design" | "planning" | "implementation";
}

export function WorkflowStepLoader({ step }: WorkflowStepLoaderProps) {
  const cfg = CONFIGS[step]!;
  const [currentStage, setCurrentStage] = useState(-1);
  const [labelVisible, setLabelVisible] = useState(true);
  const [showSwatches, setShowSwatches] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const advance = (index: number) => {
      if (index >= cfg.stages.length) {
        setShowSwatches(true);
        return;
      }
      setLabelVisible(false);
      timer = setTimeout(() => {
        setCurrentStage(index);
        setLabelVisible(true);
        timer = setTimeout(() => advance(index + 1), 900 + Math.random() * 400);
      }, 200);
    };

    timer = setTimeout(() => advance(0), 600);
    return () => clearTimeout(timer);
  }, [cfg.stages.length]);

  const pct = currentStage >= 0 ? cfg.stages[currentStage]!.pct : 0;
  const label = currentStage >= 0 ? cfg.stages[currentStage]!.label : "Initialising...";

  return (
    <div
      className="flex flex-col items-center rounded-xl border px-10 py-8 w-fit mx-auto"
      style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.1)" }}
    >
      {/* Eyebrow */}
      <span
        className="text-[10px] uppercase tracking-[0.18em] mb-2.5 font-mono"
        style={{ color: cfg.accentColor }}
      >
        {cfg.eyebrow}
      </span>

      {/* Title — uses system serif stack (Georgia) for the editorial feel */}
      <p className="text-[26px] tracking-[-0.01em] leading-snug text-white text-center font-serif">
        {cfg.titleStart}{" "}
        <em style={{ color: "rgba(255,255,255,0.45)" }}>{cfg.titleItalic}</em>
      </p>

      {/* Stage dots */}
      <div className="flex items-center gap-1.5 justify-center my-4">
        {cfg.stages.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 6,
              height: 6,
              background:
                i < currentStage
                  ? cfg.accentFaded
                  : i === currentStage
                    ? cfg.accentColor
                    : "rgba(255,255,255,0.15)",
              transform: i === currentStage ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Stage label */}
      <p
        className="text-[11px] tracking-[0.05em] min-h-[16px] font-mono transition-opacity duration-300"
        style={{
          color: "rgba(255,255,255,0.4)",
          opacity: labelVisible ? 1 : 0,
        }}
      >
        {label}
      </p>

      {/* Progress bar */}
      <div
        className="mt-3 rounded-full overflow-hidden"
        style={{ width: 180, height: 2, background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-[600ms] ease-in-out"
          style={{ width: `${pct}%`, background: cfg.accentColor }}
        />
      </div>

      {/* Colour swatches */}
      <div className="flex gap-1.5 justify-center mt-3.5">
        {cfg.swatchColors.map((color, i) => (
          <div
            key={i}
            className="rounded-[3px] transition-all duration-300"
            style={{
              width: 14,
              height: 14,
              background: color,
              opacity: showSwatches ? 1 : 0,
              transform: showSwatches ? "scale(1)" : "scale(0)",
              transitionDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
