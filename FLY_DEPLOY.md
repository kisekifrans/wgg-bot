# Fly.io Deployment — WGG Discord Bot

Host the bot 24/7 on [Fly.io](https://fly.io) (works with your existing **Vercel + Supabase** setup).

```
Vercel   → dashboard ✅
Supabase → database  ✅
Fly.io   → bot 24/7  ← this guide
```

---

## Prerequisites

- [Fly.io account](https://fly.io/app/sign-up) (credit card required, stays free within allowance)
- [flyctl CLI](https://fly.io/docs/flyctl/install/) installed
- Bot code on GitHub: [kisekifrans/wgg-bot](https://github.com/kisekifrans/wgg-bot)
- Supabase already configured (schema + migrate done locally once)

---

## Step 1 — Install flyctl (Windows)

Open **PowerShell**:

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Close and reopen PowerShell, then verify:

```powershell
fly version
```

---

## Step 2 — Login to Fly.io

```powershell
fly auth login
```

Browser opens → sign in → authorize.

---

## Step 3 — Clone & enter project

```powershell
cd D:\Frans\wgg-ticket
# or: git clone https://github.com/kisekifrans/wgg-bot.git
```

---

## Step 4 — Create the Fly app (first time only)

```powershell
fly launch --no-deploy
```

When prompted:

| Prompt | Answer |
|--------|--------|
| App name | `wgg-ticket-bot` (or your choice — update `fly.toml` if different) |
| Region | `sin` (Singapore) or closest to you |
| PostgreSQL? | **No** |
| Redis? | **No** |
| Deploy now? | **No** (we set secrets first) |

If app already exists, skip to Step 5.

> **Region tip:** `sin` = Singapore, `nrt` = Tokyo, `syd` = Sydney

---

## Step 5 — Set secrets (env vars)

**Stop `npm start` on your PC first** — one bot token = one connection.

### Option A — Import from your `.env` file (easiest)

**PowerShell:**
```powershell
cd D:\Frans\wgg-ticket
Get-Content .env | fly secrets import
```

**Git Bash / WSL:**
```bash
fly secrets import < .env
```

### Option B — Set manually

```powershell
fly secrets set `
  DISCORD_TOKEN="your_token" `
  CLIENT_ID="your_client_id" `
  GUILD_ID="your_guild_id" `
  STAFF_ROLE_ID="your_staff_role_id" `
  CATEGORY_ACCOUNT_ID="..." `
  CATEGORY_BOOSTING_ID="..." `
  CATEGORY_UNBAN_ID="..." `
  CATEGORY_RELINK_ID="..." `
  CATEGORY_PREDATOR_ID="..." `
  SUPABASE_URL="https://xxx.supabase.co" `
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" `
  START_LEGACY_DASHBOARD="false"
```

Verify:

```powershell
fly secrets list
```

---

## Step 6 — Migrate data to Supabase (if not done yet)

Run **once** on your PC (not on Fly):

```powershell
cd D:\Frans\wgg-ticket
npm run migrate:supabase
```

This pushes panels/commands from `data/store.json` → Supabase.

---

## Step 7 — Deploy

```powershell
fly deploy
```

Wait until you see `Visit your app at https://wgg-ticket-bot.fly.dev` (health endpoint only — not a website).

---

## Step 8 — Verify

```powershell
# Check machine is running
fly status

# Live logs
fly logs

# Health check
curl https://wgg-ticket-bot.fly.dev/health
```

In Discord:
- Bot should show **online**
- Test `/panel list`

---

## Useful commands

| Command | Purpose |
|---------|---------|
| `fly logs` | Live bot logs |
| `fly status` | Machine status |
| `fly restart` | Restart bot |
| `fly secrets set KEY=value` | Update a secret |
| `fly deploy --ha=false` | Deploy with **1 machine only** (required for Discord bots) |
| `fly scale count 1` | Fix if Fly created 2 machines |

---

## Update bot after code changes

```powershell
git pull origin main
fly deploy --ha=false
fly scale count 1 --yes
```

**Important:** Fly defaults to **2 machines** (high availability). Discord bots must use **1 machine** (one token = one session). Always deploy with `--ha=false`, then confirm `fly scale count 1`.

---

## Troubleshooting

### Two machines after deploy
Fly creates 2 machines by default for web apps. Discord bots need exactly 1:

```powershell
fly scale count 1 --yes -a wgg-bot
```

Or destroy the extra machine in **Machines** → trash icon. Dashboard **Edit app scale → 1** does not always apply to the next GitHub deploy — use `--ha=false` on CLI deploys.

### Bot not online
```powershell
fly logs
```
Common causes:
- Missing secret → `fly secrets list` and compare with `.env.example`
- Invalid token → reset in Discord Developer Portal, update `fly secrets set DISCORD_TOKEN=...`
- Still running locally → stop `npm start` on your PC

### App keeps restarting
```powershell
fly logs
```
Check for `Missing environment variables` — add missing secrets.

### "Cannot connect" / health check failing
Ensure `PORT=8080` is set (already in `fly.toml`). Redeploy:
```powershell
fly deploy
```

### Out of free allowance
Fly.io bills by usage. A small 256MB bot usually fits free tier, but monitor at [fly.io/dashboard](https://fly.io/dashboard). Scale down if needed:
```powershell
fly scale memory 256
fly scale count 1
```

---

## Cost note

Fly.io requires a credit card but charges only beyond the free allowance. A single `shared-cpu-1x` / 256MB machine running 24/7 is typically **~$0–3/month** depending on current Fly pricing and your allowance.

---

## Architecture

```
┌─────────────┐         ┌──────────────┐
│   Vercel    │ ◄─────► │   Supabase   │
│  dashboard  │         │   Postgres   │
└─────────────┘         └──────▲───────┘
                               │
                        poll / RPC
                               │
                        ┌──────┴───────┐
                        │   Fly.io     │
                        │  wgg-bot     │
                        │  (24/7)      │
                        └──────────────┘
                               │
                               ▼
                          Discord API
```

Changes in the Vercel dashboard sync to the bot within ~15 seconds.
