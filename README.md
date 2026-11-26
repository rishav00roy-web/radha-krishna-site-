# Shri Shri Radha-Krishna Prem Mandir website

The official website of the proposed Shri Shri Radha-Krishna Prem Mandir at Dorikamari Gaon, near the Kakodunga River, Jorhat, Assam. The project is implemented by Gousamuh Gramaya Foundation (GGF).

It is a static site with no database, no login and no server-side forms. It is available in English, Assamese and Hindi (`/en`, `/as`, `/hi`; a path without a language goes to English).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

It deploys to any Next.js host, such as Vercel or Netlify.

### Before launch: set the site address

Set the environment variable `NEXT_PUBLIC_SITE_URL` on the host to the live address, for example `https://www.your-domain.org` (no slash at the end). On Vercel this is under Project → Settings → Environment Variables; redeploy after adding it.

The site uses this address in the links it gives Google (canonical and language links) and in the preview shown when a page is shared on WhatsApp or Facebook. If it is not set, those links point to `http://localhost:3000`, which works for nobody else.

## Editing content

All content is in code. Edit it and redeploy.

| What | Where |
| --- | --- |
| Page text in all three languages | `src/i18n/dictionaries/{en,as,hi}.ts` |
| Facilities (A–H), milestones, gallery, events, announcements, project updates | `src/lib/content.ts` |
| Organisation details, contact email, WhatsApp number | `organisation` in `src/lib/content.ts` |
| Bank account shown on the Donate page | `organisation.bank` in `src/lib/content.ts` |
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

## Contact and donation forms

Neither form sends anything from the website. Each one checks the input and then opens WhatsApp to `organisation.whatsapp` with the details filled in. The visitor presses send.

The foundation has no email address yet, so `organisation.email` is `null`: the forms offer WhatsApp only and no email is shown anywhere on the site. When there is an address, put it in `organisation.email`. A "Send by email" button then appears on both forms (opening the visitor's email app, addressed to it) and the address is shown on the Contact and Organisation pages and in the footer.

The donation form asks how the visitor is giving (bank transfer or cash), the amount, purpose, name and phone number, with an optional transaction reference (UTR) and note. It takes no payment. The foundation contacts the donor to acknowledge the gift.

## Component showcase (`/showcase`)

`/showcase` is a private page for trying out the free [Annnimate](https://annnimate.com) Starter Pack components (`src/showcase/`) with the mandir's artwork. It is not linked from the site and is hidden from search engines, but anyone who types the address can open it. Remove `src/app/showcase/` and `src/showcase/` once the choice of components is done; the `three` package is used only by the showcase.

The components the site actually uses are copied into `src/components/anm/` (curtain slider, accordion) and adapted.

## Stack

Next.js 15 (App Router, statically generated), React 19, TypeScript, Tailwind CSS, GSAP with ScrollTrigger, and Lenis.
