# BLACKMERQURY v1.2.0

Release date: 2026-11-20

## Fixes
- Restored the approved v1.1 vertical category navigation on desktop and mobile.
- Ensured the particle background renders a static frame when the operating system requests reduced motion.
- Preserved the working menu stacking fix and the current portfolio, navigation, and CMS code.
- Unpublished two portfolio records whose third-party image URLs returned HTTP 404/403. Records remain in the CMS as unpublished; no portfolio data was deleted.
- Added the Hungarian privacy-notice link to the Digital Art and Motion Design enquiry forms, matching the Tattoo form.
- Fixed the website-content CMS save action: it now updates the existing `main` row instead of using an upsert that incorrectly required an INSERT RLS policy.

## Verification
- Desktop and mobile home layout checked.
- Menu open/close, language switch, category routing, filters, and lightbox checked.
- Published portfolio image URLs checked; remaining external assets returned successful responses at release verification.
- Contact forms' required-field validation checked without submitting production enquiries.
- Admin login screen checked; authenticated CMS save path corrected to use the existing row's authorised UPDATE policy. Live authenticated save still requires a browser session test.
- JavaScript syntax and video URL parser tests passed.

## Deployment note
The website source and static deployment package are ready. The Netlify site was returning its usage-limit pause page during the final live check. Restore Netlify service/usage first, then upload the BLACKMERQURY_v1.2.0_Netlify.zip contents (or deploy the release/v1.2 branch) to publish.
