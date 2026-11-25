# Atelier Photography Studio

A premium React + Supabase photography-studio website. The repository includes the public portfolio, customer authentication, a private studio dashboard, editable service quotation builder, branded multi-page PDF generation, and a Supabase Edge Function that emails the PDF to the customer and studio.

## Live application

- Website: https://d4cc854e-wedding-photography-1.sarath9-araveti.workers.dev/
- Studio admin: https://d4cc854e-wedding-photography-1.sarath9-araveti.workers.dev/studio-admin
- Quotation builder (admin only): https://d4cc854e-wedding-photography-1.sarath9-araveti.workers.dev/studio-admin/quotation

## Quotation PDF

The quotation PDF is designed as a clean A4 studio document with:
- Atelier letterhead and restrained double-line border.
- Classic serif studio heading with highly readable sans-serif details.
- Customer and celebration information in a compact summary panel.
- Simple services table with quantity, unit rate and line amount.
- Clearly highlighted total, with discount, GST/additional charges, advance and balance when supplied.
- Notes, client acceptance/signature area, consistent footer and page numbers.
- Repeated table heading and page frame when the quotation spans multiple pages.

The PDF is generated in the browser using jsPDF. The same PDF is attached to customer and studio emails through the Edge Function.

## Deploy and configure

### 1. Supabase database

The initial database setup is in `supabase/schema.sql`. For an already-created project, run `supabase/quotation-migration.sql` in Supabase SQL Editor.

The migration adds quotation JSON details and makes quotation records administrator-only. It also removes the ability for a signed-in user to update their own profile row, preventing self-assignment of the admin role.

Create your first admin in Supabase Authentication, then assign the role using the user's UUID in SQL:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_AUTH_USER_UUID';
```

Do not make the role editable from the public application.

### 2. Supabase Auth settings

Set the Site URL to the deployed website URL and add this redirect URL:

```
https://d4cc854e-wedding-photography-1.sarath9-araveti.workers.dev/**
```

Use email/password authentication. For reliable customer verification email delivery, configure a custom SMTP provider rather than relying on the low-volume default email service.

### 3. Frontend build variables

Cloudflare Pages/Workers build settings should use:

- Build command: `npm run build`
- Output directory: `dist`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Supabase project URL and public/publishable key. Never use a Supabase service-role or secret key in frontend variables.

### 4. Deploy quotation email function

Deploy `supabase/functions/send-quotation-email/index.ts` as the Supabase Edge Function named `send-quotation-email`.

Set these Edge Function secrets in Supabase:

- `RESEND_API_KEY` — private Resend API key.
- `RESEND_FROM_EMAIL` — sender address on a domain verified in Resend.
- `STUDIO_NOTIFICATION_EMAIL` — studio inbox that receives a copy.

The function validates the caller's Supabase session and checks the caller's profile role is `admin` before sending. It sends the PDF attachment to the customer and a notification copy to the studio. Do not expose the Resend API key in the frontend.

### 5. Verify before public launch

1. Run the quotation SQL migration.
2. Deploy the Edge Function and add the three Resend secrets.
3. Confirm the sender domain is verified in Resend.
4. Sign in using the studio administrator account.
5. Create a test quotation using an email address you control.
6. Check the PDF's page layout and both email inboxes.
7. Replace demo contact details, studio name if desired, and sample portfolio images/videos with studio-owned content.

## Build validation

GitHub Actions runs `npm install` and `npm run build` on pushes and pull requests to `main`.

## Notes

- PDF creation and download are browser-side; email delivery requires the deployed Supabase Edge Function and Resend secrets.
- The quotation builder is intended for authenticated studio administrators, not public visitors.
- Sample collection prices and portfolio photos are demo content. Confirm your actual rates and image usage rights before launch.
- Local development is optional; the deployed website can be used from a browser.
