import { renderToBuffer } from "@json-render/react-pdf/render";
import type { Spec } from "@json-render/core";

export async function POST(req: Request) {
  const { spec, download, filename } = (await req.json()) as {
    spec: Spec;
    download?: boolean;
    filename?: string;
  };

  if (!spec || !spec.root || !spec.elements) {
    return new Response("Invalid spec", { status: 400 });
  }

  const buffer = await renderToBuffer(spec);

  const disposition = download
    ? `attachment; filename="${filename ?? "document"}.pdf"`
    : `inline; filename="${filename ?? "document"}.pdf"`;

  return new Response(buffer as unknown as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
