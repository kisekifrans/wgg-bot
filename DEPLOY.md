# Deployment Guide — WGG Ticket

## Architecture (recommended)

| Component | Where to host | Why |
|-----------|---------------|-----|
| **Discord Bot** | Railway, Render, Fly.io, VPS | Must run 24/7 — Vercel cannot host persistent bots |
| **Dashboard** | Vercel | Perfect for Next.js + serverless API routes |
| **Database** | Supabase | Panels, commands, ticket counter — shared by bot & dashboard |

```
┌─────────────┐     Discord OAuth      ┌──────────────┐
│  Dashboard  │ ◄──────────────────► │   Supabase   │
│   (Vercel)  │      read/write       │  PostgreSQL  │
└─────────────┘                       └──────▲───────┘
                                             │
                                      poll / RPC
                                             │
                                      ┌──────┴───────┐
                                      │  Discord Bot │
                                      │   (Railway)  │
                                      └──────────────┘
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in **SQL Editor**
3. **Authentication → Providers → Discord**
   - Client ID: same as your Discord application
   - Client Secret: from Discord Developer Portal
4. **Authentication → URL Configuration**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

## 2. Migrate existing data

```bash
# In project root (.env with SUPABASE_* + GUILD_ID)
node scripts/migrate-to-supabase.js
```

## 3. Deploy dashboard to Vercel

1. Import repo, set **Root Directory** to `dashboard`
2. Add environment variables from `dashboard/.env.local.example`
3. Deploy

## 4. Deploy bot (Oracle Cloud Free VM — recommended)

See **[ORACLE_DEPLOY.md](./ORACLE_DEPLOY.md)** for the full step-by-step guide.

Quick summary:
1. Create Ubuntu ARM VM on Oracle Cloud (Always Free)
2. SSH in → run `deploy/oracle-setup.sh`
3. Edit `~/wgg-bot/.env` with your tokens
4. `npm run migrate:supabase && pm2 start ecosystem.config.cjs`

## 4b. Deploy bot (Railway / other)

1. Deploy root folder (not `dashboard/`)
2. Set all bot env vars including:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `START_LEGACY_DASHBOARD=false`
3. Start command: `npm start`

## 5. Discord login access

Dashboard verifies:
- You are the **guild owner**, OR
- You have **Administrator** permission in `GUILD_ID`, OR
- Your Discord ID is in `ALLOWED_DISCORD_IDS`

## Local development

**Bot only (JSON store):**
```bash
npm start
# Legacy dashboard: http://localhost:3847
```

**Bot + Supabase:**
```bash
# .env with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm start
```

**Next.js dashboard:**
```bash
cd dashboard
cp .env.local.example .env.local
npm install
npm run dev
# http://localhost:3000
```
