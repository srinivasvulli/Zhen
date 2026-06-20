# Deploy Zhen with Git and Vercel

## Required project files

- `package.json` — Next.js build and runtime dependencies
- `vercel.json` — production security headers
- `.gitignore` — excludes environment files, build output, and dependencies
- `.env.example` — every environment variable required by the app
- `supabase/migrations/` — database schema to apply before deploying
- `middleware.ts` — portfolio subdomain and custom-domain routing

## 1. Create the Git repository

Run these commands in the project folder:

```powershell
git init
git add .
git commit -m "Initial Zhen application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/zhen.git
git push -u origin main
```

Create the empty GitHub repository before adding the remote. Do not commit `.env.local` or any Stripe, OpenAI, or Supabase keys.

## 2. Prepare Supabase

Create a Supabase project and execute these migrations, in order:

1. `202606200001_initial_schema.sql`
2. `202606200002_billing.sql`
3. `202606200003_regions_and_project_links.sql`
4. `202606200004_custom_domains.sql`

Enable Email authentication. Add these redirect URLs under Authentication → URL Configuration:

```text
http://localhost:3000/auth/callback
https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
https://nolayout.com/auth/callback
```

## 3. Deploy with Vercel

1. In Vercel, select **Add New → Project** and import the GitHub repository.
2. Confirm the framework preset is **Next.js**.
3. Add every environment variable from `.env.example` under **Settings → Environment Variables**.
4. Deploy.

Use these deployment values:

```text
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
NEXT_PUBLIC_ROOT_DOMAIN=nolayout.com
```

Replace `NEXT_PUBLIC_SITE_URL` with `https://nolayout.com` after the production domain is live.

## 4. Connect Stripe

Create a recurring $12/year Price in Stripe and assign its ID to `STRIPE_PRICE_ID`.

Add this Stripe webhook endpoint:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhooks/stripe
```

Subscribe it to:

- `invoice.payment_succeeded`
- `customer.subscription.deleted`

Copy Stripe's signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel.

## 5. Configure portfolio domains

For username subdomains, configure `*.nolayout.com` in Vercel and add the requested wildcard DNS record at the domain provider. The middleware rewrites `username.nolayout.com` to the relevant public portfolio.

For a custom domain, add it through Vercel Domains, then store the verified hostname in `profiles.custom_domain` using Supabase Studio. Do not include `https://` or a path.

## 6. Verify production

- Sign in using the email link.
- Import a PDF/DOCX résumé.
- Download an ATS PDF.
- Open `/portfolios/USERNAME`.
- Complete a Stripe test-mode checkout and confirm `profiles.is_premium` changes through the webhook.
