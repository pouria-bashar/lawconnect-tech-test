import { stitch } from "@google/stitch-sdk";
import { NextResponse } from "next/server";
import { getStitchProjectByProjectId } from "@workspace/db/queries/fullstack-apps";
import { getSandbox } from "@workspace/e2b/sandbox";
import { toSlug } from "@/mastra/tools/setup_project";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  const record = await getStitchProjectByProjectId(projectId);
  
  if (!record) {
    return NextResponse.json({ screens: [] });
  }

  const screens = await stitch.project(record.stitchProjectId).screens().catch(() => null);
  if (!screens?.length) {
    return NextResponse.json({ screens: [] });
  }

  const sbx = await getSandbox(projectId);
  const projectDir = `/home/user/${toSlug(record.title)}`;
  const designsDir = `${projectDir}/designs`;
  await sbx.commands.run(`mkdir -p ${designsDir}`);

  const screensWithPreview = await Promise.all(
    screens.map(async (screen) => {
      const stitchHtmlUrl = await screen.getHtml();
      const htmlContent = await fetch(stitchHtmlUrl).then((r) => r.text());
      const sandboxPath = `${designsDir}/${record.stitchProjectId}-${screen.id}.html`;
      await sbx.files.write(sandboxPath, htmlContent);
      const previewUrl = await sbx.downloadUrl(sandboxPath);
      return { screenId: screen.id, htmlUrl: previewUrl };
    }),
  );

  return NextResponse.json({ screens: screensWithPreview });
}
