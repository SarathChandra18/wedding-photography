# Atelier — Cloud Photography Studio

A premium React + Supabase starter for a photography studio. It includes a responsive public website, collection cards, quotation estimate/PDF download, customer signup/login, role-aware dashboard scaffolding, and Supabase schema with row-level security policies.

## Important status

This is a deployable starter project, not yet a live hosted service. A public URL and real authentication/email require a Supabase project and a hosting account to be connected. No real admin account is created by the source code.

## Cloud deployment (no local setup required after deployment)

1. Create a free Supabase project at https://supabase.com.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Authentication settings, enable email/password signup and configure the site's public URL and redirect URLs after deployment.
4. Create the initial admin account in Supabase Authentication. Use a temporary password, then copy its user UUID and run the final `UPDATE public.profiles SET role='admin' ...` statement in the SQL file. Change the temporary password before launch. Do not use `admin/admin` on a public website; it is not a secure password and Supabase requires stronger credentials.
5. Create a GitHub repository and upload this project.
6. Import the repository into a static hosting provider such as Cloudflare Pages or Vercel. Set build command `npm run build` and output directory `dist`.
7. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build environment variables using the Supabase project URL and anon/public key. Never use the Supabase service-role key in the browser.
8. Set the deployed website URL in Supabase Authentication URL configuration.

## Current implementation notes

- The public homepage and sample collections render without cloud credentials.
- Quote PDF generation works in the browser. With Supabase configured, enquiries are inserted into the database.
- Signup/login uses Supabase Auth when configured.
- Admin dashboard role is read from `profiles.role`.
- The admin dashboard currently has starter package creation and placeholder states for gallery/enquiries; full media upload, settings editor, customer quotation history, and email sending need to be wired to cloud services before production use.
- Email delivery should be implemented through a server-side Supabase Edge Function or another trusted backend using a provider such as Resend. Do not put email-provider secrets in frontend code.
- Replace demo studio name, email, contact information and stock images before launch. Confirm image licensing and replace demo URLs with your studio's media.

## Local preview (optional only)

`npm install` then `npm run dev`. Local preview is not required once deployed.

## Email notifications

Deploy the Supabase Edge Function in `supabase/functions/send-quotation-email` and set these Edge Function secrets in Supabase:

- `RESEND_API_KEY`
- `STUDIO_NOTIFICATION_EMAIL`
- `RESEND_FROM_EMAIL` (a sender address verified with Resend)

The quotation flow saves the enquiry and invokes this function to email the customer and notify the studio. The PDF is downloaded in the customer's browser; the current email function sends the quotation summary, not the PDF attachment. Add server-side PDF generation or pass a validated PDF attachment if an emailed PDF is required.
Supabase build configuration updated
