# Shri Shri Radha-Krishna Prem Mandir website

The official website of the proposed Shri Shri Radha-Krishna Prem Mandir at Dorikamari Gaon, near the Kakodunga River, Jorhat, Assam. The project is implemented by Gousamuh Gramaya Foundation (GGF).

It is a static site with no database and no login. The only things it sends anywhere are the Donate and founding member forms, to the foundation's Google Sheet (see below). It is available in English, Assamese and Hindi (`/en`, `/as`, `/hi`; a path without a language goes to English).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

It is hosted on Hostinger as a Node.js web app (Business or Cloud plan), which builds it from this repository. It also deploys to any other Next.js host.

### The site address

The live site is **https://rkpm.org**. That address is written in `src/lib/seo.ts`, and the site uses it in the links it gives Google (canonical and language links) and in the preview shown when a page is shared on WhatsApp or Facebook. No setting is needed on Hostinger.

If the domain ever changes, change it in `src/lib/seo.ts`. To run a test copy at another address, set the environment variable `NEXT_PUBLIC_SITE_URL` there instead (on Hostinger: hPanel → Websites → the site → Environment variables → Add, then save and redeploy; the value is fixed when the site is built).

## Editing content

All content is in code. Edit it and redeploy.

| What | Where |
| --- | --- |
| Page text in all three languages | `src/i18n/dictionaries/{en,as,hi}.ts` |
| Facilities (A–H), milestones, gallery, events, announcements, project updates | `src/lib/content.ts` |
| Organisation details, contact email, WhatsApp number | `organisation` in `src/lib/content.ts` |
| Bank account shown on the Donate page | `organisation.bank` in `src/lib/content.ts` |
| Donation sheet address (Google Apps Script web app) | `donationSheetUrl` in `src/lib/content.ts` |
| Photos and their photographer credits | `photos` and `journeyPhotos` in `src/lib/content.ts` |
| Painted artwork | `public/art/` |

### Honesty rules (from the brief)

- Every facility stays `proposed` until it really changes.
- A milestone may leave `planned` only after the foundation has verified it. Set `verified: true` and `verified_on` when you change one.
- Never add Government approvals, land ownership, coordinates, landmarks or achievements that have not been verified.
- The temple is the site's identity. Amrit Sarovar is one facility among eight.

### Photos

Photos come from [Unsplash](https://unsplash.com/license). They are illustrative and are not of this temple, so every photo on the site carries that caption and credits its photographer. To swap one, change its `id` (the `photo-…` part of an `images.unsplash.com` URL), `alt` and `credit`. When official renders and site photos arrive, put them in `public/` and replace the stock photos.

### Artwork

The painted pieces are image files in `public/art/`. They include the Radha-Krishna hero (`hero/`, in several sizes and formats), the temple concept, the foliage band, the diyas, lotus and peacock feather, the carved relief, and the ghat scene in the footer. The site labels the hero as artwork, not a photograph of the temple's deities, and the temple concept as an artistic concept, not the final design. Keep those labels when replacing either.

The scenery layers (hills, stars, moon, birds), the campus blueprint and the icons are SVG drawn in code (`src/components/painting/`, `src/components/Icon.tsx`).

## Contact form

The contact form sends nothing from the website. It checks the input and then opens the visitor's email app, addressed to `organisation.email` (gokulgramaya@gmail.com), with the details filled in. The visitor presses send. A "Send on WhatsApp" button does the same through WhatsApp to `organisation.whatsapp`. If `organisation.email` is set to `null`, the form offers WhatsApp only and no email address is shown on the site.

## Donate and founding member forms

**Donate page (money):** bank transfer or cash, the amount, purpose, transfer date, bank or app, and UTR.

**Become a founding member page (land):** people who give land for the temple become its founding members. The form asks for the owner as in the land records, district, revenue circle, mouza, village, dag and patta numbers, patta type, area in bigha, katha and lessa, land type, papers held, and any loan or dispute. The menu's highlighted link and the footer button lead here.

Both forms also ask for the donor's name, father's or spouse's name, organisation, phone, email, full address and PAN, and for consent to keep the details. Both use `src/components/DonateForm.tsx`. No payment is taken on the website.

The forms send the details to a Google Sheet in the foundation's account, run by the script in [`google-sheet/Code.gs`](google-sheet/Code.gs):
- Money goes to the **Donations** tab and land to **Founding members**. The account that owns the sheet gets an email alert for each new entry.
- When someone at the foundation has checked the bank statement (or counted the cash), they tick **Verified**. The donor is then emailed a numbered PDF receipt (GGF/2026-27/0001 and so on), and the row gets a one-tap link to send the same receipt on WhatsApp.
- Founding members get no receipt, because a gift of land is completed only by a registered deed.
- The foundation is not registered under Section 80G, and the receipt says so.

To set it up, follow [`google-sheet/SETUP.md`](google-sheet/SETUP.md), then put the web-app address in `donationSheetUrl` in `src/lib/content.ts`. Until it is set, both forms work like the contact form: they open email or WhatsApp with every detail filled in.

## Component showcase (`/showcase`)

`/showcase` is a private page for trying out the free [Annnimate](https://annnimate.com) Starter Pack components (`src/showcase/`) with the mandir's artwork. It is not linked from the site and is hidden from search engines, but anyone who types the address can open it. Remove `src/app/showcase/` and `src/showcase/` once the choice of components is done; the `three` package is used only by the showcase.

The components the site actually uses are copied into `src/components/anm/` (curtain slider, accordion) and adapted.

## Stack

Next.js 15 (App Router, statically generated), React 19, TypeScript, Tailwind CSS, GSAP with ScrollTrigger, and Lenis.
