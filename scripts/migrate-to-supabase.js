require('dotenv').config();
const { loadStore } = require('../utils/store');
const { seedFromJsonStore } = require('../utils/supabaseStore');
const { isSupabaseEnabled } = require('../utils/supabaseClient');

async function main() {
  if (!isSupabaseEnabled()) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first');
    process.exit(1);
  }

  const jsonStore = loadStore();
  await seedFromJsonStore(jsonStore);
  console.log('✅ Migrated data/store.json → Supabase');
  console.log(`   Panels: ${jsonStore.panels.length}`);
  console.log(`   Commands: ${jsonStore.customCommands.length}`);
  console.log(`   Counter: ${jsonStore.ticketCounter}`);
}

main().catch(console.error);
