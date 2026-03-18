import { getSandbox } from "@workspace/e2b/sandbox";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { url?: string; html?: string };

  let html: string;

  if (body.html) {
    html = body.html;
  } else if (body.url) {
    const htmlRes = await fetch(body.url);
    if (!htmlRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch HTML content — the sandbox URL may have expired" },
        { status: 502 },
      );
    }
    html = await htmlRes.text();
  } else {
    return NextResponse.json({ error: "Missing html or url" }, { status: 400 });
  }

  if (!html.trim()) {
    return NextResponse.json({ error: "HTML content is empty" }, { status: 400 });
  }

  try {
    const sbx = await getSandbox();

    await sbx.files.write("/home/user/export-input.html", html);

    // Playwright + Chromium are pre-installed in the sandbox template
    const result = await sbx.commands.run(
      `node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///home/user/export-input.html', { waitUntil: 'networkidle' });
  await page.pdf({ path: '/home/user/export-output.pdf', format: 'A4', printBackground: true });
  await browser.close();
})();
"`,
      { timeoutMs: 60_000, onStderr: console.log },
    );

    if (result.exitCode !== 0) {
      console.error("PDF export failed:", result.stderr);
      return NextResponse.json(
        { error: result.stderr || "PDF generation failed" },
        { status: 500 },
      );
    }

    const url = await sbx.downloadUrl("/home/user/export-output.pdf");
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF export failed";
    console.error("PDF export failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
