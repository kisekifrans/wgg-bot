#!/bin/bash
# WGG Bot — Oracle Cloud VM setup script
# Run on Ubuntu 22.04/24.04 (ARM or x86) after SSH login:
#   curl -fsSL https://raw.githubusercontent.com/kisekifrans/wgg-bot/main/deploy/oracle-setup.sh | bash

set -euo pipefail

APP_DIR="$HOME/wgg-bot"
REPO_URL="https://github.com/kisekifrans/wgg-bot.git"
NODE_MAJOR=20

echo "=========================================="
echo "  WGG Bot — Oracle Cloud Setup"
echo "=========================================="

# --- System packages ---
echo "[1/7] Updating system..."
sudo apt update -qq
sudo apt upgrade -y -qq
sudo apt install -y -qq curl git ca-certificates

# --- Node.js ---
echo "[2/7] Installing Node.js ${NODE_MAJOR}..."
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt ${NODE_MAJOR} ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt install -y -qq nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# --- PM2 ---
echo "[3/7] Installing PM2..."
sudo npm install -g pm2
pm2 -v

# --- Clone or update repo ---
echo "[4/7] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# --- Dependencies ---
echo "[5/7] Installing npm dependencies..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev

mkdir -p logs

# --- .env check ---
echo "[6/7] Checking .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "⚠️  .env created from template. EDIT IT NOW before starting the bot:"
  echo "    nano $APP_DIR/.env"
  echo ""
  echo "Required values:"
  echo "  - DISCORD_TOKEN, CLIENT_ID, GUILD_ID, STAFF_ROLE_ID"
  echo "  - CATEGORY_*_ID (all 5 categories)"
  echo "  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  echo "  - START_LEGACY_DASHBOARD=false"
  echo ""
  echo "After editing .env, run:"
  echo "  cd $APP_DIR && npm run migrate:supabase   # first time only"
  echo "  pm2 start ecosystem.config.cjs"
  echo "  pm2 save"
  echo "  pm2 startup    # copy & run the sudo command it prints"
  exit 0
fi

# --- Migrate (safe to re-run) ---
echo "[7/7] Migrating data to Supabase (if needed)..."
npm run migrate:supabase || echo "Migration skipped or already done."

# --- Start with PM2 ---
pm2 delete wgg-bot 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ Bot started!"
pm2 status
echo ""
echo "Useful commands:"
echo "  pm2 logs wgg-bot       # view live logs"
echo "  pm2 restart wgg-bot    # restart after .env changes"
echo "  pm2 status             # check if online"
echo ""
echo "If bot doesn't survive reboot, run: pm2 startup"
echo "Then copy & run the sudo command it prints, followed by: pm2 save"
