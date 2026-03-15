# Project Guidelines

## Data Fetching

Always use `@tanstack/react-query` for data fetching operations (queries, mutations, polling). Never use raw `fetch` in `useEffect` or manual polling loops.

- Use `useQuery` with `refetchInterval` for polling
- Use `useMutation` for POST/PUT/DELETE operations
- Define query keys in `apps/web/lib/query-keys.ts`
- Create dedicated reusable hooks in `apps/web/hooks/` for all react-query operations (e.g., `use-build-polling.ts`, `use-deploy.ts`)
- Components should import and use these hooks rather than calling react-query directly

## Database

The database layer lives in the shared `@workspace/db` package (`packages/db/`). The web app never imports `drizzle-orm` directly.

### Schema
- Define schemas in `packages/db/src/schema/` using Drizzle ORM with `pgSchema()` for isolated Postgres schemas
- Export types (`InsertX`, `SelectX`) from the schema file
- Register new schemas in `packages/db/src/index.ts`

### Queries
- Write query functions in `packages/db/src/queries/` (e.g., `build-jobs.ts`, `synthetic-test.ts`)
- Import `db` from `@workspace/db` and schema from `@workspace/db/schema/*` within query files
- The web app imports query functions via `@workspace/db/queries/*` — never use `db` or `drizzle-orm` directly in `apps/web/`

### Migrations
- Generate migrations: `cd packages/db && pnpm db:generate`
- Migrations output to `supabase/migrations/`
- Push schema changes: use Supabase CLI to apply migrations
- For local dev, `pnpm db:push` can push directly (requires `DATABASE_URL` env var)
