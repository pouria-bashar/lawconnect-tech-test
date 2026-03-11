import { saveLead } from "@workspace/db/queries/lead-capture";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, phone, legalArea, description, intakeData } =
    await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 },
    );
  }

  try {
    const lead = await saveLead({
      name,
      email,
      phone: phone ?? null,
      legalArea: legalArea ?? null,
      description: description ?? null,
      intakeData: intakeData ?? null,
    });
    return NextResponse.json(lead);
  } catch (error: unknown) {
    console.error("Lead save error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
