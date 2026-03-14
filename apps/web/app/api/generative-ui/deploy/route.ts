import { deployWorkerWithAssets } from "@/lib/cloudflare";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    url?: string;
    html?: string;
    scriptName?: string;
  };

  let html: string;

  if (body.html) {
    // Direct HTML provided — skip E2B fetch
    html = body.html;
  } else if (body.url) {
    // Fetch HTML content from E2B download URL
    const htmlRes = await fetch(body.url);
    if (!htmlRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch HTML content — the sandbox URL may have expired" },
        { status: 502 },
      );
    }
    html = await htmlRes.text();
  } else {
    return NextResponse.json(
      { error: "Missing html or url" },
      { status: 400 },
    );
  }

  if (!html.trim()) {
    return NextResponse.json({ error: "HTML content is empty" }, { status: 400 });
  }

  try {
    const result = await deployWorkerWithAssets(html, body.scriptName);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Deployment failed";
    console.error("Deploy to Cloudflare failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
