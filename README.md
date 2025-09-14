# Sibyl — Mini Legal Marketplace (Monorepo)

This is a monorepo skeleton for the Sibyl technical test.

- Frontend: Next.js (TypeScript), TailwindCSS, shadcn/ui (to be configured), React Query
- Backend: Express (TypeScript), Prisma ORM, JWT auth, RBAC, Zod validation, Multer uploads, Supabase Storage, Stripe (test), pagination utilities
- Shared: Types/enums/Zod schemas shared between FE/BE

[API Documentation](./apps/api/README.md)

## Structure

- `apps/api` — Express API server
- `apps/web` — Next.js app
- `packages/shared` — Shared types and schemas

## Getting Started

1. Install dependencies (use npm workspaces):
   - `npm install`
2. Create environment files:
   - `cp .env.example apps/api/.env`
   - `cp .env.example apps/web/.env.local` (then trim to required keys)
3. Setup database and Prisma:
   - Update `DATABASE_URL` in `apps/api/.env`.
   - `npm run prisma:generate -w @sibyl/api`
   - `npm run prisma:migrate -w @sibyl/api`
4. Start servers:
   - API: `npm run dev:api`
   - Web: `npm run dev:web`

## Notes

- All sensitive operations are server-side; the FE only calls API endpoints.
- File uploads use Supabase Storage with short-lived signed URLs for downloads.
- Stripe in test mode; webhook handler placeholder provided.
- RBAC enforces Client vs Lawyer access.

## Supabase Storage Setup

- Create a Supabase project and a private Storage bucket (e.g. `sibyl-legal-marketplace`).
- In `apps/api/.env`, set:
  - `SUPABASE_URL` — your project URL
  - `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, never expose to FE)
  - `SUPABASE_BUCKET` — bucket name
  - `SUPABASE_SIGNED_URL_TTL_SECONDS` — e.g., `300`
- Ensure the bucket is private. The API uploads files via the service role and issues signed URLs for time-limited downloads.

## Deploy

- Use any host (e.g., Vercel for web, Render/Fly/Heroku for API). Ensure object storage is external.
- Configure environment variables in each platform. See `.env.example`.
