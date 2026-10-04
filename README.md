# Velora — full-stack store (Next.js 14, Prisma, PostgreSQL)

## Run locally
```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```
## Demo credentials
- Admin: admin@velora.dev / Admin@12345
- User: maya@velora.dev / User@12345

## Deploy (Vercel + Neon/Supabase)
1. Create a Postgres database and copy its connection string.
2. Import the repo in Vercel; set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
3. Run once against production: `npx prisma migrate deploy && npm run db:seed`.

## Security notes
Passwords are bcrypt-hashed; sessions are signed httpOnly JWT cookies; role is re-read from the DB per request; admin APIs return 403 for non-admins; prices and stock are validated server-side inside a transaction.

## Not yet built
Admin product create/edit UI, users and inventory pages, DB-backed cart, reviews UI, multi-step checkout, cart drawer, scroll/page-transition motion, tests.
