# SustainBit AI Platform

AI-powered monorepo with three modules: legal lead capture, blog writing, and synthetic test generation.

## Monorepo Structure

```
├── apps/
│   └── web/              # Next.js 16 app (Turbopack)
├── packages/
│   ├── db/               # Shared database (Drizzle ORM + Supabase Postgres)
│   ├── ui/               # Shared UI components (shadcn/ui)
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
└── supabase/
    └── migrations/       # Database migrations
```

## Features

- **Lead Capture** — AI-driven legal intake with dynamic form rendering and lawyer matching
- **Blog Writer** — AI blog generation with Tiptap rich text editor and database persistence
- **Synthetic Test Generator** — Natural language to Playwright tests with Monaco editor and E2B sandbox execution

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase CLI
- Supabase project

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp apps/web/.env.example apps/web/.env.local
```

3. Push database migrations:

```bash
supabase db push
```

4. Start development:

```bash
pnpm dev
```

## Packages

### `@workspace/db`

Shared database package using Drizzle ORM with custom Postgres schemas per feature:

| Schema | Tables | Purpose |
|--------|--------|---------|
| `lead_capture` | `leads` | Legal intake submissions |
| `blog` | `posts` | Blog posts (Tiptap JSON) |
| `synthetic_test` | `tests`, `test_reports` | Playwright tests and run reports |

Exports schema definitions (`@workspace/db/schema/*`) and query functions (`@workspace/db/queries/*`).

### `@workspace/ui`

Shared UI components built with shadcn/ui. Add new components:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Use in code:

```tsx
import { Button } from "@workspace/ui/components/button";
```
