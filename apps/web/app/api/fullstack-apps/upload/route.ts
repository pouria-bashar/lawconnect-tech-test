import { getSandbox } from "@workspace/e2b/sandbox";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const sbx = await getSandbox();
  const sandboxPath = `/home/user/uploads/${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await sbx.files.write(sandboxPath, arrayBuffer);

  return NextResponse.json({ path: sandboxPath, name: file.name });
}
