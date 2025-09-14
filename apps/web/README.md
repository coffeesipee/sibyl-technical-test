# Sibyl Web (Next.js)

This is the frontend for the Sibyl mini legal marketplace.

- Framework: Next.js App Router (TypeScript)
- UI: TailwindCSS + shadcn/ui
- Data fetching: React Query
- Auth: JWT stored in cookie (sent via Authorization header)
- API base: `NEXT_PUBLIC_API_URL` (points to the Express API)

## Environment Variables

Create `.env.local` (or `.env` in this folder):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

In production (e.g., Vercel), set `NEXT_PUBLIC_API_URL` to your deployed API URL.

## App Routes

All routes below are relative to `apps/web/src/app/` and are rendered by the App Router. Auth-protected pages expect an auth cookie set by the app on login/signup pages.

### Public

- `/` (`page.tsx`)
  - If logged in, redirects to `/dashboard/{role}`. Otherwise shows landing.

- `/auth/login` (`auth/login/page.tsx`)
  - Login form. On success, sets auth cookie and redirects to the appropriate dashboard.

- `/auth/signup` (`auth/signup/page.tsx`)
  - Signup form with role selection (client or lawyer) and related fields.

### Client Dashboard

- `/dashboard/client` (`dashboard/client/page.tsx`)
  - Requires client auth.
  - Lists "My Cases" with pagination.
  - Shows per-case quote count via `_count.quotes`.
  - Card click navigates to case detail: `/cases/[id]`.

### Lawyer Dashboard

- `/dashboard/lawyer` (`dashboard/lawyer/page.tsx`)
  - Requires lawyer auth.
  - Marketplace for open cases with filters.
    - `created_since`: date filter persisted in the URL.
  - Renders case cards which link to `/cases/[id]`.

- `/dashboard/lawyer/quotes` (`dashboard/lawyer/quotes/page.tsx`)
  - Requires lawyer auth.
  - Lists the current lawyer’s quotes with optional status filter.
    - `status`: one of `proposed`, `accepted`, `rejected`, or `all`.
  - Each item card supports:
    - Click to open detail: `/dashboard/lawyer/quotes/[id]`.
    - Edit link visibility controlled by `canEdit` prop and lawyer ownership.

- `/dashboard/lawyer/quotes/new` (`dashboard/lawyer/quotes/new/page.tsx`)
  - Optional page to create a new quote (if present in your flow). Uses `QuoteForm`.

- `/dashboard/lawyer/quotes/[id]` (`dashboard/lawyer/quotes/[id]/page.tsx`)
  - Quote detail page (read-only display).
  - Shows quote (status, amount, expected days, note) and related case (title, category, status).
  - If the quote’s status is `accepted` and the API returns `case.files`, a Files section is displayed via `CaseFileList`.
  - Includes an Edit link to `/dashboard/lawyer/quotes/[id]/edit`.

- `/dashboard/lawyer/quotes/[id]/edit` (`dashboard/lawyer/quotes/[id]/edit/page.tsx`)
  - Edit form for an existing quote.
  - Prefills current values. Uses `QuoteForm` which posts via server actions.

### Cases

- `/cases/new` (`cases/new/page.tsx`)
  - Requires client auth.
  - Create a new case using a simple form (title/category/description).

- `/cases/[id]` (`cases/[id]/page.tsx`)
  - Case detail view.
  - Access: case owner (client) or accepted lawyer.
  - Shows case metadata, files (with download via signed URL), and quotes (for client view).

## Components & Actions

- `components/quote-form.tsx`
  - Reusable form for creating/updating a quote (`amount`, `expectedDays`, `note`).
  - Uses React Hook Form with Zod validation; numeric inputs are controlled and pre-filled via `defaultValues`.

- `components/case/CaseFileList.tsx`
  - Displays a list of files for a case with a download button (uses server action to fetch signed URL).

- `app/cases/[id]/file-actions.ts`
  - Server action to fetch signed file download URLs from the API.

- `dashboard/lawyer/quotes/[id]/actions.ts`
  - Server actions for loading a quote (`getMyQuote`) and upserting (`upsertQuote`).

- `dashboard/lawyer/actions.ts`
  - Server action to fetch marketplace cases with `created_since` filter.

- `dashboard/client/actions.ts`
  - Server action to fetch client’s cases with pagination.

## Navigation Notes

- The root page lowercases the value of the `USER_ROLE` cookie and redirects to `/dashboard/{role}`.
- Quote list cards navigate to the quote detail page on card click.
- Edit visibility on quote items is controlled by passing `canEdit` to `QuoteCardItem`.

## Dev Scripts

From the monorepo root:

- Install: `npm install`
- Run Web: `npm run dev -w @sibyl/web`
- Build Web: `npm run build -w @sibyl/web`

Ensure the API is running and `NEXT_PUBLIC_API_URL` is set to point to it.
