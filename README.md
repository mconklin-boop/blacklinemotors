# Blackline Motors Website

First production-ready Next.js build for Blackline Motors, a modern automotive dealership and commercial vehicle platform.

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod form validation
- Supabase placeholder configuration
- Vercel-compatible deployment

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Production Build

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values when integrations are ready.

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase is not connected by default. `lib/supabase.ts` returns `null` until public Supabase variables are provided.

## Folder Structure

- `app/`: App Router pages, metadata, SEO files, and API placeholders
- `components/`: Reusable layout, inventory, message, CTA, and form components
- `data/`: Local sample inventory
- `lib/`: Formatting, validation, disclosures, Supabase, and partner inventory placeholders
- `types/`: Shared TypeScript models

## Editing Sample Vehicles

Update `data/vehicles.ts`. Each vehicle follows the `Vehicle` type in `types/vehicle.ts` and supports sale, monthly lease, commercial rental, lease-to-own, and request-only transaction types.

## Supabase Plan

Future Supabase integration should add tables for vehicles, photos, leads, form submissions, partner inventory mappings, users, and audit records. Keep writes server-side and avoid exposing service-role keys to the browser.

## Partner Inventory Plan

`lib/partnerInventory.ts` is a placeholder for future approved partner feeds. Add authentication, data normalization, disclosure handling, and ownership flags before showing partner inventory publicly.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add environment variables from `.env.example`.
4. Run the production build command.
5. Review vehicle disclosures and legal pages before public launch.
