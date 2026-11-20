# Shri Shri Radha-Krishna Prem Mandir — website

Official website for the proposed Shri Shri Radha-Krishna Prem Mandir temple campus at Dorikamari Gaon, near the Kakodunga River, Jorhat, Assam. An initiative of Gousamuh Gramaya Foundation (GGF).

**Stack:** Next.js 15 (App Router, React 19) · Tailwind CSS · Supabase (Postgres, Auth, Storage) · GSAP + Lenis for motion · English, Assamese and Hindi.

## Content rules (from the brief)

- Every campus facility is labelled **Proposed** until construction is complete and verified.
- Progress stages show as **Planned** unless verified. The database enforces this: a milestone cannot be `in_progress` or `completed` unless `verified = true`.
- Map coordinates, directions and landmarks stay hidden until an admin enters verified values.
- No invented approvals, land ownership, construction or achievements anywhere on the site.
- The temple is the main identity; Amrit Sarovar and the other facilities are supporting elements.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values, or leave empty to preview with built-in content
npm run dev                  # http://localhost:3000 -> redirects to /en
```

Without Supabase variables the public site renders from `src/lib/seed.ts`, the contact form says it is not connected yet, and the admin shows setup instructions.

## Connect Supabase

1. Create a Supabase project.
2. In the SQL editor run `supabase/migrations/0001_schema.sql`, then `0002_seed.sql`.
3. Copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Authentication → Providers: keep Email enabled and **turn off "Allow new users to sign up"**. Staff are invited, never self-registered.
5. Invite the first admin (Authentication → Users → Invite), then promote them:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'you@example.org';
   ```

## Admin (`/admin`)

| Role | Can do |
| --- | --- |
| Viewer | See the dashboard |
| Editor | Events, announcements, gallery and architectural designs (image/video upload), master-plan facilities, project updates |
| Admin | Everything an editor can, plus construction progress, organisation details, site media (logo, hero render, master-plan drawing), location, enquiries |
| Super admin | Everything, plus users and roles |

Every rule is enforced twice: in the server actions and in Postgres row-level security.

## Replacing placeholders

Placeholders are clearly marked on the site. Upload the real material in the admin:

- **GGF logo, homepage temple render, master-plan drawing:** Organisation and site → Website media.
- **Architectural renders, Radha-Krishna art, facility photos, videos:** Gallery and designs (untick "This is a placeholder").
- **Facility photos on the master plan:** Master plan facilities → Image.

## Deploy

Deploy to Vercel (or any Node host). Set the three environment variables from `.env.example`. HTTPS and HSTS headers are on by default (`next.config.ts`).

## Backup and recovery

- Supabase takes daily backups on paid plans (Database → Backups), with point-in-time recovery as an add-on.
- For your own copies: `SUPABASE_DB_URL=... ./scripts/backup.sh` writes a gzipped SQL dump to `backups/`. Restore with `gunzip -c backups/<file>.sql.gz | psql "$SUPABASE_DB_URL"`.
- Uploaded files live in the `media` storage bucket; download it from the dashboard or with the Supabase CLI.

## Translations

`src/i18n/dictionaries/{en,as,hi}.ts` hold the interface text. The Assamese and Hindi files are drafts and should be reviewed by native speakers before launch, especially place names. Database content (facilities, events, updates) has English, Assamese and Hindi fields; empty translations fall back to English.

## Project structure

```
src/app/[locale]/        public pages (en, as, hi)
src/app/admin/           admin panel, login, server actions
src/components/          UI: header, hero illustration, icons, master plan, gallery, calendar, forms
src/lib/                 data access, seed content, auth, admin resource definitions
supabase/migrations/     schema, RLS, storage, seed
```
