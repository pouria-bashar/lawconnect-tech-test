import { useMutation } from "@tanstack/react-query";

interface ExportPdfParams {
  url: string;
}

interface ExportPdfResult {
  url: string;
}

export function useExportPdf() {
  return useMutation({
    mutationFn: async (params: ExportPdfParams): Promise<ExportPdfResult> => {
      const res = await fetch("/api/generative-ui/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PDF export failed");
      return { url: data.url };
    },
  });
}
