import { NextResponse } from "next/server";

const CF_API_TOKEN = process.env.CF_API_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_DISPATCH_NAMESPACE = process.env.CF_DISPATCH_NAMESPACE!;

export async function GET() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/dispatch/namespaces/${CF_DISPATCH_NAMESPACE}/scripts`,
    { headers: { Authorization: `Bearer ${CF_API_TOKEN}` } },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to list workers" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data.result ?? []);
}
