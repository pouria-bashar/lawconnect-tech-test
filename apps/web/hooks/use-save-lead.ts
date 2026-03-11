import { useState, useCallback } from "react";

import type { AsyncState } from "@/hooks/use-save-blog";

interface SaveLeadParams {
  name: string;
  email: string;
  phone?: string;
  legalArea?: string;
  description?: string;
  intakeData?: Record<string, unknown>;
}

export function useSaveLead() {
  const [state, setState] = useState<AsyncState>("idle");

  const save = useCallback(async (params: SaveLeadParams) => {
    setState("loading");
    try {
      
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setState("success");
      return data;
    } catch {
      setState("error");
      throw new Error("Failed to save lead");
    }
  }, []);

  const reset = useCallback(() => setState("idle"), []);

  return { state, save, reset };
}
