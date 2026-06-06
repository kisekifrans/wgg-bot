# Bulk sync environment variables across Fly, Vercel, and local dashboard.
# Usage (from repo root):
#   .\scripts\sync-env.ps1              # show copy-paste blocks
#   .\scripts\sync-env.ps1 -Fly         # import root .env → Fly.io
#   .\scripts\sync-env.ps1 -Vercel      # import dashboard/.env.local → Vercel

param(
  [switch]$Fly,
  [switch]$Vercel
)

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$BotEnv = Join-Path $RepoRoot '.env'
$DashEnv = Join-Path $RepoRoot 'dashboard\.env.local'
$FlyBin = Join-Path $env:USERPROFILE '.fly\bin\fly.exe'

function Read-DotEnv([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Missing $Path" }
  $vars = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    $vars[$key] = $val
  }
  return $vars
}

if ($Fly) {
  if (-not (Test-Path $FlyBin)) { throw "Fly CLI not found. Install: iwr https://fly.io/install.ps1 -useb | iex" }
  & $FlyBin auth whoami 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Run: fly auth login" }
  Write-Host "Importing $BotEnv → Fly (wgg-bot)..." -ForegroundColor Cyan
  Get-Content $BotEnv | & $FlyBin secrets import -a wgg-bot
  Write-Host "Done. Restart: fly apps restart wgg-bot" -ForegroundColor Green
  exit 0
}

if ($Vercel) {
  if (-not (Test-Path $DashEnv)) { throw "Missing $DashEnv — create from dashboard/.env.local.example" }
  Push-Location (Join-Path $RepoRoot 'dashboard')
  foreach ($line in Get-Content $DashEnv) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $parts = $line -split '=', 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()
    Write-Host "Setting Vercel env: $name" -ForegroundColor Cyan
    $value | vercel env add $name production --force 2>$null
  }
  Pop-Location
  Write-Host "Done. Redeploy on Vercel dashboard." -ForegroundColor Green
  exit 0
}

Write-Host @"

=== BULK ENV SYNC GUIDE ===

FLY.IO (bot — repo root .env)
  Dashboard: https://fly.io/apps/wgg-bot/secrets → Add Secrets → paste entire .env
  CLI:       .\scripts\sync-env.ps1 -Fly
             (requires: fly auth login)

VERCEL (dashboard — dashboard/.env.local)
  Dashboard: Project → Settings → Environment Variables → paste .env.local contents
  CLI pull:  cd dashboard && vercel env pull .env.local
  CLI push:  .\scripts\sync-env.ps1 -Vercel  (requires: vercel login)

SUPABASE (no .env file — project settings only)
  API keys:  https://supabase.com/dashboard/project/icwwitylszukujdcxskn/settings/api
  OAuth:     Authentication → Providers → Discord (Client ID + Client Secret)
  SQL seed:  Run supabase/seed-panels.sql in SQL Editor

"@ -ForegroundColor Yellow
