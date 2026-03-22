import { Mastra } from "@mastra/core"
import { ArizeExporter } from "@mastra/arize"
import { Observability } from "@mastra/observability"
import { leadAgent } from "./agents/lead-agent"
import { PostgresStore } from "@mastra/pg"

import { blogAgent } from "./agents/blog-agent"
import { syntheticTestAgent } from "./agents/synthetic-test-agent"
import { immigrationResearchAgent } from "./agents/immigration-agent"
import { codingAgent } from "./agents/coding-agent"
import { fullStackAgent } from "./agents/full-stack-agent"
import { designAgent } from "./agents/design-agent"

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
    fullStackAgent,
    designAgent,
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
