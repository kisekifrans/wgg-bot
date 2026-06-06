require('dotenv').config();
const { loadStore } = require('../utils/store');
const { seedFromJsonStore } = require('../utils/supabaseStore');
const { isSupabaseEnabled } = require('../utils/supabaseClient');

async function main() {
  if (!isSupabaseEnabled()) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first');
    process.exit(1);
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  try {
    const role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role;
    if (role !== 'service_role') {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not the real service_role key (got role:', role + ')');
      console.error('   Get it from Supabase → Settings → API → service_role (secret)');
      console.error('   Or run supabase/seed-panels.sql in Supabase SQL Editor instead.');
      process.exit(1);
    }
  } catch {
    console.warn('⚠️  Could not verify service_role key format');
  }

  const jsonStore = loadStore();
  await seedFromJsonStore(jsonStore);
  console.log('✅ Migrated data/store.json → Supabase');
  console.log(`   Panels: ${jsonStore.panels.length}`);
  console.log(`   Commands: ${jsonStore.customCommands.length}`);
  console.log(`   Counter: ${jsonStore.ticketCounter}`);
}

main().catch(console.error);
