import { Mastra } from "@mastra/core";
import { leadAgent } from "./agents/leadAgent";
import { PostgresStore } from '@mastra/pg'

import { blogAgent } from "./agents/blogAgent";
import { syntheticTestAgent } from "./agents/syntheticTestAgent";
import { immigrationResearchAgent } from "./agents/immigrationAgent";
import { codingAgent } from "./agents/codingAgent";

const storage = new PostgresStore({
  id: "pg-storage",
  connectionString: process.env.DATABASE_URL,
  schemaName: 'mastra'
})

export const mastra = new Mastra({
  agents: {
    leadAgent,
    blogAgent,
    syntheticTestAgent,
    immigrationResearchAgent,
    codingAgent,
  },
  storage,
  
  // server: {
  //   auth: new MastraAuthSupabase({
  //     url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   }),
  // },
})
