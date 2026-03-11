import { Mastra } from "@mastra/core";
import { MastraAuthSupabase } from "@mastra/auth-supabase";
import { leadAgent } from "./agents/leadAgent";
import { pdfAgent } from "./agents/pdfAgent";

export const mastra = new Mastra({
  agents: { leadAgent, pdfAgent },
  server: {
    auth: new MastraAuthSupabase({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }),
  },
});
