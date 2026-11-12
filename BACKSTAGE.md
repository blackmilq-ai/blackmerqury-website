# BLACKMERQURY website / Backstage notes

## Development branch
- Repository: `blackmilq-ai/blackmerqury-website`
- Working branch: `feature/blackmerqury-cms`
- Production branch: `main`
- Website: `https://blackmerqury.art`
- This branch is not published. Do not merge or deploy without the owner's exact release instruction: `élesítsd`.

## Public site
- One-page portfolio with in-place routes: Digital Art, Tattoo, Motion Design.
- Category filters and keyboard-accessible full-screen portfolio lightbox.
- Portfolio items are loaded from Supabase when the request succeeds; static reference content remains as a fallback if the CMS query fails.
- Tattoo, Digital Art and Motion Design enquiry forms submit to `public.contact_requests`.
- A submitted enquiry is a request only; it does not confirm an appointment.
- The privacy notice is at `/privacy.html`.

## Backstage CMS
- Entry point: `/admin.html`
- Authentication: Supabase Auth password sign-in; public registration is not provided.
- Admin authorization: membership in `public.cms_admins`.
- Portfolio management: add, edit, upload, publish/unpublish, reorder and delete.
- Supported media: JPEG, PNG, WEBP, GIF, AVIF, MP4, WEBM; maximum 50 MB.
- Uploaded media is stored in the public `portfolio-media` bucket. Only authenticated CMS admins may upload, update or delete objects.
- New enquiry requests are available in the Backstage INBOX tab. Admins can change request status or delete requests.

## Supabase
- Project: `blackmerqury-cms`
- Project ref: `qtwjrnicbkfuexnisivx`
- Region: EU Central (Frankfurt)
- Frontend uses the publishable key only. Never add a service-role or secret key to browser code.
- RLS is enabled on `cms_admins`, `portfolio_items` and `contact_requests`.
- Anonymous visitors can submit contact requests but cannot read them. Authenticated CMS admins can read and manage requests.

## Release checks still required
1. Enable Supabase Leaked Password Protection in Authentication settings.
2. Complete a browser-based end-to-end test of sign-in, portfolio CRUD, media upload, public form submission and Backstage inbox.
3. Confirm the privacy notice details and retention criteria before public launch.
4. Decide whether email notifications are required. They are not configured yet; new requests currently appear in Backstage INBOX.
5. Configure Resend: verify the approved sending subdomain `mail.blackmerqury.art`, add the DNS records Resend supplies, and set `RESEND_API_KEY` as a Supabase Edge Function secret. The notification function source is in `supabase/functions/notify-inquiry/index.ts`; it sends to the discipline-specific inbox and marks the request as notified. The key must never be committed to GitHub.\n6. Confirm the final Facebook and TikTok profile URLs if direct platform links should replace the Linktree social hub.
7. Only after explicit authorization, deploy the Edge Function, merge/publish the branch and verify the production site.
