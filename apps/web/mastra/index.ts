import { Mastra } from "@mastra/core"
import { ArizeExporter } from "@mastra/arize"
import { Observability } from "@mastra/observability"
import { leadAgent } from "./agents/leadAgent"
import { PostgresStore } from "@mastra/pg"

import { blogAgent } from "./agents/blogAgent"
import { syntheticTestAgent } from "./agents/syntheticTestAgent"
import { immigrationResearchAgent } from "./agents/immigrationAgent"
import { codingAgent } from "./agents/codingAgent"

const storage = new PostgresStore({
  id: "pg-storage",
  connectionString: process.env.DATABASE_URL,
  schemaName: "mastra",
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
  observability: new Observability({
    configs: {
      arize: {
        serviceName: process.env.PHOENIX_PROJECT_NAME || "lawconnect",
        exporters: [
          new ArizeExporter({
            endpoint:
              process.env.PHOENIX_ENDPOINT ||
              "https://app.phoenix.arize.com/v1/traces",
            apiKey: process.env.PHOENIX_API_KEY,
            projectName: process.env.PHOENIX_PROJECT_NAME || "lawconnect",
          }),
        ],
      },
    },
  }),
})
