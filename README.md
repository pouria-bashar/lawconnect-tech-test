# LawConnect Tech Test

AI-powered legal tech platform built as a monorepo with three modules: lead capture, blog writing, and synthetic test generation. Each module uses Mastra AI agents to provide intelligent, conversational workflows.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5.9
- **AI:** Mastra agents + Vercel AI SDK (supports Google Gemini, OpenAI, Anthropic)
- **Database:** Supabase (PostgreSQL) + Drizzle ORM
- **UI:** React 19, TailwindCSS 4, shadcn/ui, Tiptap (rich text), Monaco (code editor)
- **Sandbox:** E2B (for running Playwright tests)
- **Monorepo:** pnpm workspaces + Turborepo

## Monorepo Structure

```
├── apps/
│   └── web/                    # Next.js app
│       ├── app/                # App Router pages & API routes
│       ├── mastra/             # Mastra agent definitions & tools
│       └── remotion-compositions/ # Video composition (Remotion)
├── packages/
│   ├── db/                     # Drizzle ORM schemas & queries
│   ├── ui/                     # Shared shadcn/ui components
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared TypeScript config
└── supabase/
    └── migrations/             # SQL migration files
```

## Features

### Lead Capture (`/lead-capture`)
AI-driven legal intake flow. The agent asks 3 dynamic questions to understand the legal issue, pre-fills an intake form, then matches the user with relevant lawyers from the database.

### Blog Writer (`/blogs`)
AI blog generation. Describe a topic and the agent produces a blog post rendered in a Tiptap rich text editor. Posts can be edited and saved to the database.

### Synthetic Test Generator (`/synthetic-test`)
Natural language to Playwright E2E tests. Describe a test scenario and the agent generates Playwright code, displayed in a Monaco editor. Tests can be dry-run in an E2B sandbox and scheduled via cron.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A [Supabase](https://supabase.com/) project (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) (for migrations)

### 1. Clone and install

```bash
git clone <repo-url>
cd my-test
pnpm install
```

### 2. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` and fill in the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `DATABASE_URL` | Yes | Supabase Postgres connection string (found in Supabase Dashboard → Settings → Database) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI API key for Gemini models |
| `E2B_API_KEY` | No | E2B API key (only needed for synthetic test sandbox execution) |
| `FIRECRAWL_API_KEY` | No | Firecrawl API key (only needed for web scraping MCP) |
| `NEXT_PUBLIC_APP_URL` | No | Defaults to `http://localhost:3000` |
| `CRON_SECRET` | No | Secret for cron-triggered test runs |

### 3. Set up the database

Link your Supabase project and push the migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Alternatively, push the schema directly via Drizzle:

```bash
pnpm --filter @workspace/db db:push
```

### 4. Run the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Sign up

Navigate to `/signup` to create an account. Auth routes (`/login`, `/signup`) are handled by Supabase Auth. All other routes are protected and require authentication.

## Available Scripts

From the root of the monorepo:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode (Turbopack) |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |

From `packages/db`:

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Drizzle migrations from schema changes |
| `pnpm db:push` | Push schema directly to the database |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |

From `apps/web`:

| Command | Description |
|---------|-------------|
| `pnpm remotion:studio` | Open Remotion Studio for video composition |

## Database Schema

Three isolated Postgres schemas managed by Drizzle ORM:

| Schema | Tables | Purpose |
|--------|--------|---------|
| `lead_capture` | `leads`, `lawyers` | Legal intake submissions and lawyer directory |
| `blog` | `posts` | Blog posts stored as Tiptap JSON |
| `synthetic_test` | `tests`, `test_reports` | Playwright test definitions and execution reports |

Schema definitions live in `packages/db/src/schema/` and are exported as `@workspace/db/schema/*`.
Query functions live in `packages/db/src/queries/` and are exported as `@workspace/db/queries/*`.

## Shared UI Package (`@workspace/ui`)

Built with shadcn/ui. To add a new component:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import in code:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## API Routes

```
app/api/
├── leads/
│   ├── chat/           # Lead capture agent chat
│   └── save/           # Save lead to database
├── blogs/
│   ├── chat/           # Blog generation agent chat
│   └── save/           # Save blog post
└── synthetic-test/
    ├── chat/           # Test generation agent chat
    ├── dry-run/        # Execute test in E2B sandbox
    ├── run/            # Cron-triggered test execution
    └── [id]/
        └── reports/    # Test execution reports
```
