import { useMutation } from "@tanstack/react-query";

interface DeployParams {
  url: string;
  scriptName?: string;
}

interface DeployResult {
  url: string;
  scriptName: string;
}

export function useDeploy() {
  return useMutation({
    mutationFn: async (params: DeployParams): Promise<DeployResult> => {
      const res = await fetch("/api/generative-ui/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");
      return { url: data.url, scriptName: data.scriptName };
    },
  });
}
