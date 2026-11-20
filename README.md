# Shri Shri Radha-Krishna Prem Mandir website

The official website of the proposed Shri Shri Radha-Krishna Prem Mandir at Dorikamari Gaon, near the Kakodunga River, Jorhat, Assam. The project is implemented by Gousamuh Gramaya Foundation (GGF).

It is a static site with no database, no login and no server-side forms. It is available in English, Assamese and Hindi.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

It deploys to any Next.js host, such as Vercel or Netlify, with no environment variables. Set `NEXT_PUBLIC_SITE_URL` to the live domain once there is one.

## Editing content

All content is in code. Edit it and redeploy.

| What | Where |
| --- | --- |
| Page text in all three languages | `src/i18n/dictionaries/{en,as,hi}.ts` |
| Facilities (A–H), milestones, gallery, events, announcements, project updates | `src/lib/content.ts` |
| Organisation details, contact email, WhatsApp number | `organisation` in `src/lib/content.ts` |
| Photos and their photographer credits | `photos` in `src/lib/content.ts` |

### Honesty rules (from the brief)

- Every facility stays `proposed` until it really changes.
- A milestone may leave `planned` only after the foundation has verified it. Set `verified: true` and `verified_on` when you change one.
- Never add Government approvals, land ownership, coordinates, landmarks or achievements that have not been verified.
- The temple is the site's identity. Amrit Sarovar is one facility among eight.

### Photos

Photos come from [Unsplash](https://unsplash.com/license). They are illustrative and are not of this temple, so every photo on the site carries that caption and credits its photographer. To swap one, change its `id` (the `photo-…` part of an `images.unsplash.com` URL), `alt` and `credit`. When official renders and site photos arrive, put them in `public/` and replace the stock photos.

## Contact and donation forms

Neither form sends anything from the website. Each one checks the input and then opens the visitor's email app, addressed to `organisation.email`, with the details filled in. The visitor presses send. A "Send on WhatsApp" button does the same through WhatsApp to `organisation.whatsapp`.

The donation form asks for the amount, purpose, name and phone number. It takes no payment. The foundation contacts the donor to complete the donation.

**`organisation.email` is a placeholder (`info@example.org`). Replace it with the foundation's real address before launch.** If it is set to `null`, the forms fall back to WhatsApp only.

## Stack

Next.js 15 (App Router, statically generated), React 19, TypeScript, Tailwind CSS, GSAP with ScrollTrigger, and Lenis. The icons and the temple illustration are original SVG.
