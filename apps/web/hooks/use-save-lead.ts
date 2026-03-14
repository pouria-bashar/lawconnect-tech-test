import { useMutation } from "@tanstack/react-query";
import { toAsyncState } from "@/hooks/use-save-blog";

interface SaveLeadParams {
  name: string;
  email: string;
  phone?: string;
  legalArea?: string;
  description?: string;
  intakeData?: Record<string, unknown>;
}

export function useSaveLead() {
  const mutation = useMutation({
    mutationFn: async (params: SaveLeadParams) => {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to save lead");
      return res.json();
    },
  });

  const state = toAsyncState(mutation.status);

  return {
    state,
    save: mutation.mutateAsync,
    reset: mutation.reset,
  };
}
