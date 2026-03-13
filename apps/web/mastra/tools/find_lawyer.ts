import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { findLawyersByIssueType } from "@workspace/db/queries/lead-capture";

export const findLawyerTool = createTool({
  id: "find_lawyer",
  description:
    "Find the right lawyer for the user based on the form data they submitted. Called automatically after the user submits the legal form.",
  inputSchema: z.object({
    issueType: z
      .enum([
        "neighbour_dispute",
        "property",
        "tenancy",
        "consumer",
        "employment",
        "family",
        "immigration",
        "general",
      ])
      .describe("Type of legal issue"),
    location: z.string().optional().describe("User's location or jurisdiction"),
    description: z.string().describe("Brief description of the legal issue"),
    formData: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("The full form data submitted by the user"),
  }),
  outputSchema: z.object({
    lawyers: z.array(
      z.object({
        name: z.string(),
        specialty: z.string(),
        rating: z.number(),
        location: z.string(),
        phone: z.string(),
        email: z.string(),
        bio: z.string(),
      }),
    ),
  }),
  execute: async (input) => {
    const results = await findLawyersByIssueType(input.issueType);

    return {
      lawyers: results.map((l) => ({
        name: l.name,
        specialty: l.specialty,
        rating: l.rating,
        location: l.location,
        phone: l.phone,
        email: l.email,
        bio: l.bio,
      })),
    };
  },
});
