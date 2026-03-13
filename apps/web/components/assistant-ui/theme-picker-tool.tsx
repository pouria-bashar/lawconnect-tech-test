"use client";

import { defaultPresets } from "@workspace/ui/lib/theme-preset";
import { cn } from "@workspace/ui/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { PaletteIcon } from "lucide-react";
import { useState } from "react";

const presetEntries = Object.entries(defaultPresets);

export function ThemePicker({
  selectedTheme,
  onThemeChange,
}: {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = defaultPresets[selectedTheme];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md bg-transparent px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Select theme"
        >
          <PaletteIcon className="size-3.5" />
          <span className="hidden sm:inline">{current?.label ?? "Theme"}</span>
          {current && (
            <div className="flex gap-0.5">
              <div
                className="size-3 rounded-full border"
                style={{ backgroundColor: current.styles.light.primary }}
              />
              <div
                className="size-3 rounded-full border"
                style={{ backgroundColor: current.styles.light.accent }}
              />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 max-h-80 overflow-y-auto p-2"
      >
        <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
          Pick a theme
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {presetEntries.map(([id, preset]) => {
            const light = preset.styles.light;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onThemeChange(id);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-md border p-2 text-left transition-all hover:bg-muted",
                  selectedTheme === id &&
                    "ring-2 ring-primary border-primary",
                )}
              >
                <div className="flex w-full gap-0.5">
                  <div
                    className="h-4 flex-1 rounded-sm"
                    style={{ backgroundColor: light.primary }}
                  />
                  <div
                    className="h-4 flex-1 rounded-sm"
                    style={{ backgroundColor: light.secondary }}
                  />
                  <div
                    className="h-4 flex-1 rounded-sm"
                    style={{ backgroundColor: light.accent }}
                  />
                  <div
                    className="h-4 flex-1 rounded-sm border"
                    style={{ backgroundColor: light.background }}
                  />
                </div>
                <span className="text-[10px] font-medium leading-tight text-foreground">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
