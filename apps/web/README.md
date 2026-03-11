# Web App

AI-powered platform built with Next.js, Mastra, and assistant-ui. Features three main modules:

- **Lead Capture** — AI-driven legal intake flow with dynamic form rendering (json-render) and lawyer matching
- **Blog Writer** — AI blog generation with a Tiptap rich text editor, save-to-database flow
- **Synthetic Test Generator** — Describe tests in natural language, generate Playwright code displayed in Monaco editor, dry-run via E2B sandbox

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **AI Agents**: Mastra with Google Gemini 2.5 Flash
- **Chat UI**: assistant-ui
- **Auth**: Supabase Auth (SSR)
- **Database**: Supabase Postgres via Drizzle ORM (custom schemas per feature)
- **Rich Text**: Tiptap
- **Code Editor**: Monaco Editor
- **Sandbox**: E2B for test execution
- **Monorepo**: pnpm + Turborepo

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (with custom schemas created via migrations)
- Google AI API key
- E2B API key (for synthetic tests)

### Setup

1. Copy the environment file and fill in your values:

```bash
cp .env.example .env.local
```

2. Install dependencies from the monorepo root:

```bash
pnpm install
```

3. Push database migrations:

```bash
cd ../../
supabase db push
```

4. Start the dev server:

```bash
pnpm dev --filter web
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
apps/web/
├── app/
│   ├── (auth)/          # Login/signup pages
│   ├── api/             # API routes (chat handlers, blog/lead save, dry-run)
│   ├── blogs/           # Blog writer page + individual blog view
│   ├── lead-capture/    # Legal intake chat page
│   └── synthetic-test/  # Test generator page
├── components/
│   ├── assistant-ui/    # Tool UIs (ask-question, json-render, tiptap-render, test-render)
│   ├── tiptap-editor.tsx
│   └── app-header.tsx
├── hooks/               # useSaveBlog, useSaveLead
├── lib/
│   ├── supabase/        # Client/server Supabase helpers
│   ├── e2b/             # Sandbox lifecycle and code execution
│   └── json-render.ts   # Component registry
└── mastra/
    ├── agents/          # leadAgent, blogAgent, syntheticTestAgent, pdfAgent
    ├── tools/           # askQuestion, renderUi, renderBlog, saveBlog, renderTest, findLawyer
    └── index.ts         # Mastra instance with Supabase auth
```

## Database

The shared `@workspace/db` package uses Drizzle ORM with three custom Postgres schemas:

| Schema | Tables | Purpose |
|--------|--------|---------|
| `lead_capture` | `leads` | Legal intake form submissions |
| `blog` | `posts` | Blog posts with Tiptap JSON content |
| `synthetic_test` | `tests`, `test_reports` | Playwright test definitions and run reports |

Migrations live in `supabase/migrations/` at the monorepo root.
