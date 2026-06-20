# Zhen — AI Portfolio & ATS Resume Builder

Next.js 15 application with two data-entry tracks that write to a shared Supabase profile graph:

- **Track A:** PDF/DOCX text extraction → GPT-4o-mini JSON parser → Zod validation → Supabase persistence.
- **Track B:** live form → modern portfolio preview + server-generated, ATS-safe PDF résumé.

## Local setup

1. Install Node.js 20.9+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and add the Supabase URL, anonymous key, and server-only OpenAI key.
3. Create a Supabase project, then run `supabase/migrations/202606200001_initial_schema.sql` in its SQL editor or via the Supabase CLI.
4. Enable Email authentication in Supabase and add your local/deployed `/auth/callback` URL to Authentication → URL Configuration. Importing or saving requires an authenticated user.
5. Run `npm run dev`.

## Deploy to Vercel

1. Import this repository into Vercel; it detects Next.js automatically.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY` in Vercel Environment Variables.
3. Deploy. Do not expose `OPENAI_API_KEY` with a `NEXT_PUBLIC_` prefix.

`vercel.json` adds baseline browser security headers. The app requires a Node.js server runtime for PDF/DOCX parsing and PDF generation, so it is not compatible with static-only hosts such as GitHub Pages.

## Architecture notes

- The portfolio page (`/p/[username]`) is intentionally visual and can render `image_url` project assets.
- The PDF renderer never reads project images; it uses Helvetica, a single column, standard headings, and text elements only.
- `POST /api/resume/parse` limits imports to 5MB, supports only PDF/DOCX, requires an authenticated user, validates AI output with Zod, and writes only through Row Level Security.
- `POST /api/ai/polish` rewrites notes without inventing results. Review the generated bullets before publishing.

## Next production integrations

The core product is implemented. Billing, custom-domain provisioning, and visitor analytics require provider credentials and webhooks, so add Stripe, a DNS/domain provider, and privacy-approved event collection before enabling the $12/year upsell.
