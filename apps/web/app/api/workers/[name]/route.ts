import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";

const CF_API_TOKEN = process.env.CF_API_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_DISPATCH_NAMESPACE = process.env.CF_DISPATCH_NAMESPACE!;

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  try {
    const cf = new Cloudflare({ apiToken: CF_API_TOKEN });
    await cf.workersForPlatforms.dispatch.namespaces.scripts.delete(
      CF_DISPATCH_NAMESPACE,
      name,
      { account_id: CF_ACCOUNT_ID },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    console.error("Delete worker failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
