import { useMutation } from "@tanstack/react-query";

export function useCancelBuild() {
  return useMutation({
    mutationFn: async (toolCallId: string): Promise<void> => {
      await fetch(`/api/generative-ui/cancel/${toolCallId}`, {
        method: "POST",
      });
    },
  });
}
