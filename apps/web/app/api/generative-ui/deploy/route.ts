import { deployWorkerWithAssets } from "@/lib/cloudflare";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { url?: string };

  if (!body.url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Fetch HTML content from E2B download URL
  const htmlRes = await fetch(body.url);
  if (!htmlRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch HTML content — the sandbox URL may have expired" },
      { status: 502 },
    );
  }

  const html = await htmlRes.text();
  if (!html.trim()) {
    return NextResponse.json({ error: "HTML content is empty" }, { status: 400 });
  }

  try {
    const result = await deployWorkerWithAssets(html);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Deployment failed";
    console.error("Deploy to Cloudflare failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
