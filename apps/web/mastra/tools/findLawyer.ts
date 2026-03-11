import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const findLawyerTool = createTool({
  id: "find_lawyer",
  description:
    "Find the right lawyer for the user based on the form data they submitted. Called automatically after the user submits the legal form.",
  inputSchema: z.object({
    issueType: z
      .string()
      .describe("Type of legal issue (e.g. neighbour dispute, tenancy, consumer, employment)"),
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
    // In a real app this would query a database or API.
    // For now, return mock lawyers based on the issue type.
    const issueType = (input.issueType ?? "").toLowerCase();

    const lawyerPool = [
      {
        name: "Sarah Mitchell",
        specialty: "Property & Neighbour Disputes",
        rating: 4.8,
        location: "Sydney, NSW",
        phone: "(02) 9123 4567",
        email: "s.mitchell@lawfirm.com.au",
        bio: "15 years experience in property law and neighbour disputes. Known for achieving amicable resolutions.",
      },
      {
        name: "James Chen",
        specialty: "Tenancy & Rental Law",
        rating: 4.9,
        location: "Melbourne, VIC",
        phone: "(03) 9876 5432",
        email: "j.chen@tenancylaw.com.au",
        bio: "Specialist in residential tenancy disputes, bond recovery, and lease negotiations.",
      },
      {
        name: "Emma Williams",
        specialty: "Consumer Rights",
        rating: 4.7,
        location: "Brisbane, QLD",
        phone: "(07) 3456 7890",
        email: "e.williams@consumerlaw.com.au",
        bio: "Expert in consumer protection law, refund disputes, and product liability claims.",
      },
      {
        name: "David Kumar",
        specialty: "Employment Law",
        rating: 4.6,
        location: "Perth, WA",
        phone: "(08) 6543 2100",
        email: "d.kumar@employmentlaw.com.au",
        bio: "Handles unfair dismissal, workplace harassment, and contract disputes.",
      },
      {
        name: "Lisa Park",
        specialty: "General Civil Litigation",
        rating: 4.5,
        location: "Adelaide, SA",
        phone: "(08) 7654 3210",
        email: "l.park@civillaw.com.au",
        bio: "Broad civil litigation practice covering disputes, mediation, and small claims.",
      },
    ];

    // Pick relevant lawyers based on issue type keywords
    const keywords: Record<string, string[]> = {
      "Property & Neighbour Disputes": ["neighbour", "property", "fence", "noise", "driveway", "boundary"],
      "Tenancy & Rental Law": ["tenant", "landlord", "rent", "lease", "bond", "eviction"],
      "Consumer Rights": ["consumer", "refund", "product", "warranty", "purchase"],
      "Employment Law": ["employment", "work", "fired", "dismissed", "harassment", "wage"],
    };

    const matched = lawyerPool.filter((lawyer) => {
      const kws = keywords[lawyer.specialty] ?? [];
      return kws.some((kw) => issueType.includes(kw) || (input.description ?? "").toLowerCase().includes(kw));
    });

    // Always include at least the general practitioner
    const general = lawyerPool.find((l) => l.specialty.includes("General"))!;
    const results = matched.length > 0 ? matched : [general];

    // Add general practitioner if not already included
    if (!results.find((l) => l.specialty.includes("General"))) {
      results.push(general);
    }

    return { lawyers: results.slice(0, 3) };
  },
});
