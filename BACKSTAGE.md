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
- Netlify security response headers are defined in `_headers`.
- Portfolio items are loaded from Supabase when the request succeeds; static reference content remains as a fallback if the CMS query fails.
- Tattoo, Digital Art and Motion Design enquiry forms submit to `public.contact_requests`.
- Tattoo visitors can also open the existing SimplyBook appointment page directly.
- A submitted enquiry is a request only; it does not confirm an appointment.
- English and Hungarian privacy notices are available at `/privacy.html` and `/adatvedelem.html`.

## Backstage CMS
- Entry point: `/admin.html`
- Authentication: Supabase Auth password sign-in; public registration is not provided.
- Admin authorization: membership in `public.cms_admins`.
- Portfolio management: add, edit, upload, publish/unpublish, reorder and delete.
- Supported media: JPEG, PNG, WEBP, GIF, AVIF, MP4, WEBM; maximum 50 MB.
- Uploaded media is stored in the public `portfolio-media` bucket. Only authenticated CMS admins may upload, update or delete objects.
- New enquiry requests are available in the Backstage INBOX tab. Admins can change request status, send/retry email notification or delete requests.
- Public enquiries use server-side validation, a hidden honeypot and a limit of three submissions per email address per hour.

## Supabase
- Project: `blackmerqury-cms`
- Project ref: `qtwjrnicbkfuexnisivx`
- Region: EU Central (Frankfurt)
- Frontend uses the publishable key only. Never add a service-role or secret key to browser code.
- RLS is enabled on `cms_admins`, `portfolio_items` and `contact_requests`.
- Anonymous visitors can submit contact requests but cannot read them. Authenticated CMS admins can read and manage requests.
- The notification Edge Function uses the service-role key only server-side and reads `GOOGLE_APPS_SCRIPT_SECRET` from Supabase Function Secrets.

## Release checks still required
1. Enable Supabase Leaked Password Protection in Authentication settings.
2. Copy the existing `GOOGLE_APPS_SCRIPT_SECRET` value from the Apps Script `SECRET` setting into Supabase Function Secrets for the `blackmerqury-cms` project. Do not paste the secret into chat or commit it to GitHub. The existing deployed Apps Script `/exec` URL is already referenced in `supabase/functions/notify-inquiry/index.ts`; notifications use the sender display name `blackmerqury` and go to the discipline-specific inbox. The email alert contains only the enquiry category and internal request ID.
3. Confirm the privacy notice details and retention criteria before public launch.
4. Confirm the final Facebook and TikTok profile URLs if direct platform links should replace the Linktree social hub.
5. Complete browser-based end-to-end tests of sign-in, portfolio CRUD, media upload, public form submission, email notification and Backstage inbox.
6. Only after explicit authorization, deploy the Edge Function, merge/publish the branch and verify the production site.
