const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

let client = null;

function getServiceRoleFromKey(key) {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    return payload.role || null;
  } catch {
    return null;
  }
}

function validateServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return null;
  }

  const role = getServiceRoleFromKey(key);
  if (role && role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is the "${role}" key, not service_role. ` +
        'Copy the real service_role secret from Supabase → Settings → API.',
    );
  }

  return role;
}

function getSupabase() {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  // Node 20 on Alpine has no native WebSocket — ws is required by @supabase/supabase-js
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });

  return client;
}

function isSupabaseEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = { getSupabase, isSupabaseEnabled, validateServiceRoleKey };
