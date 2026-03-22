import { stitch } from "@google/stitch-sdk";
import { NextResponse } from "next/server";
import { getStitchProjectByProjectId } from "@workspace/db/queries/fullstack-apps";
import { getSandbox } from "@workspace/e2b/sandbox";

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

  const [sbx, screens] = await Promise.all([
    getSandbox(),
    stitch.project(record.stitchProjectId).screens(),
  ]);
  

  const screensWithPreview = await Promise.all(
    screens.map(async (screen) => {
      
      const stitchHtmlUrl = await screen.getHtml();
      const htmlContent = await fetch(stitchHtmlUrl).then((r) => r.text());
      const sandboxPath = `/home/user/designs/${record.stitchProjectId}-${screen.id}.html`;
      await sbx.files.write(sandboxPath, htmlContent);
      const previewUrl = await sbx.downloadUrl(sandboxPath);
      return { screenId: screen.id, htmlUrl: previewUrl };
    }),
  );

  return NextResponse.json({ screens: screensWithPreview });
}
