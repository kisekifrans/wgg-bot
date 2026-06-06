# Oracle Cloud Free VM — WGG Bot Deployment

Complete guide to host the Discord bot 24/7 on Oracle Cloud Always Free tier.

**You already have:** Vercel (dashboard) + Supabase (database)  
**This guide sets up:** the bot process on Oracle VM

---

## Part 1 — Create the VM (Oracle Console)

### 1. Sign in
Go to [cloud.oracle.com](https://cloud.oracle.com) → Sign in

### 2. Create a VM instance
1. **Menu (☰) → Compute → Instances**
2. Click **Create instance**

### 3. Configure instance

| Setting | Value |
|---------|-------|
| **Name** | `wgg-bot` |
| **Image** | Ubuntu 22.04 or 24.04 (aarch64 = ARM, always free) |
| **Shape** | Ampere A1 — **1 OCPU, 6 GB RAM** (fits free tier) |
| **Boot volume** | 50 GB default is fine |

### 4. Networking
- Use default VCN or create new
- **Assign a public IPv4 address** ✅

### 5. SSH keys
- Choose **Generate a key pair for me**
- **Download the private key** (`ssh-key-*.key`) — you need this to connect

### 6. Create
Click **Create** — wait until state = **Running** (green)

### 7. Open SSH port (Security List)
1. On the instance page, click your **Subnet** link
2. Click the **Security List**
3. **Add Ingress Rule:**
   - Source CIDR: `0.0.0.0/0` (or your home IP for better security)
   - IP Protocol: TCP
   - Destination port: `22`
4. Save

> The bot only needs **outbound** internet (Discord + Supabase). No other inbound ports required.

---

## Part 2 — Connect via SSH

### Windows (PowerShell)

```powershell
# Move your downloaded key somewhere safe, e.g. D:\Keys\oracle-wgg.key
# Fix permissions (first time only):
icacls "D:\Keys\oracle-wgg.key" /inheritance:r /grant:r "$env:USERNAME:R"

# Connect (replace IP with your instance's Public IP)
ssh -i "D:\Keys\oracle-wgg.key" ubuntu@YOUR_PUBLIC_IP
```

### Default usernames by image
| Image | Username |
|-------|----------|
| Ubuntu | `ubuntu` |
| Oracle Linux | `opc` |

---

## Part 3 — Run the setup script

Once logged into the VM:

```bash
curl -fsSL https://raw.githubusercontent.com/kisekifrans/wgg-bot/main/deploy/oracle-setup.sh | bash
```

If the script isn't on GitHub yet, run manually:

```bash
git clone https://github.com/kisekifrans/wgg-bot.git ~/wgg-bot
cd ~/wgg-bot
bash deploy/oracle-setup.sh
```

---

## Part 4 — Configure `.env`

```bash
nano ~/wgg-bot/.env
```

Paste your values (copy from local `.env` or fill in):

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
STAFF_ROLE_ID=your_staff_role_id

CATEGORY_ACCOUNT_ID=
CATEGORY_BOOSTING_ID=
CATEGORY_UNBAN_ID=
CATEGORY_RELINK_ID=
CATEGORY_PREDATOR_ID=

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

START_LEGACY_DASHBOARD=false
```

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

## Part 5 — Migrate data & start bot

```bash
cd ~/wgg-bot

# Push local panel/command config to Supabase (first time)
npm run migrate:supabase

# Start bot with PM2
pm2 start ecosystem.config.cjs
pm2 save

# Auto-start on reboot
pm2 startup
# ⚠️ Copy and run the sudo command PM2 prints, then:
pm2 save
```

---

## Part 6 — Verify

```bash
pm2 status          # should show "online"
pm2 logs wgg-bot    # should show "Bot online as WGG Ticket#..."
```

In Discord:
- Bot should appear **online**
- Run `/panel list` to test slash commands

---

## Useful PM2 commands

| Command | What it does |
|---------|--------------|
| `pm2 logs wgg-bot` | Live logs |
| `pm2 restart wgg-bot` | Restart after `.env` change |
| `pm2 stop wgg-bot` | Stop bot |
| `pm2 status` | Check status |

---

## Update bot after code changes

```bash
cd ~/wgg-bot
git pull origin main
npm install --omit=dev
pm2 restart wgg-bot
```

---

## Troubleshooting

### Can't SSH connect
- Check Security List allows port **22**
- Confirm you're using the correct username (`ubuntu`)
- Confirm Public IP hasn't changed (Oracle may reassign if instance stopped)

### Bot crashes on start
```bash
pm2 logs wgg-bot --lines 50
```
Common fixes:
- Missing env var → fill in `.env`
- Invalid Discord token → regenerate in Developer Portal
- Supabase keys wrong → copy from Supabase → Settings → API

### Bot offline but PM2 says online
- Check Discord token wasn't reset
- `pm2 restart wgg-bot`

### `iptables` blocking (rare on Ubuntu)
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 22 -j ACCEPT
sudo apt install iptables-persistent -y
sudo netfilter-persistent save
```

---

## Architecture reminder

```
Vercel     → dashboard (edit panels/commands)
Supabase   → database (shared config)
Oracle VM  → bot running 24/7 (this guide)
```

All three work together. Changes in the Vercel dashboard appear in the bot within ~15 seconds (Supabase poll).
