const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
let supabaseUrl, serviceKey;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceKey = val;
    }
  });
} catch (e) {
  console.error("Could not read .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

// Kelompok 56 members
const KELOMPOK_56 = [
  { nim: '1231030055', name: 'Arpan Maulana' },
  { nim: '1234060108', name: 'Aisyah Shofa Aini' },
  { nim: '1237010003', name: 'Tifa Astrianti' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat' },
  { nim: '1232040021', name: 'Indah Sri Rahayu' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan' },
  { nim: '1232090080', name: 'Nurdin' },
  { nim: '1231040133', name: 'Hanifah Mauludiah' },
  { nim: '1239240280', name: 'Ridwan Firmansyah' },
];

const RIDWAN_NIM = '1239240280';

async function checkLogbookStatus() {
  console.log('=== CEK STATUS LOGBOOK KELOMPOK 56 ===\n');

  // 1. Get all Ridwan's logbook entries
  const { data: ridwanEntries, error: ridwanErr } = await supabase
    .from('logbook_entry')
    .select('id, nim, entry_date')
    .eq('nim', RIDWAN_NIM)
    .order('entry_date', { ascending: true });

  if (ridwanErr) {
    console.error('Error fetching Ridwan data:', ridwanErr.message);
    return;
  }

  console.log(`📋 Ridwan Firmansyah (${RIDWAN_NIM}) punya ${ridwanEntries.length} entry logbook:`);
  ridwanEntries.forEach(e => console.log(`   - ${e.entry_date}`));
  console.log('');

  // 2. Get Ridwan's activities for each entry
  if (ridwanEntries.length > 0) {
    const entryIds = ridwanEntries.map(e => e.id);
    const { data: ridwanActivities, error: actErr } = await supabase
      .from('logbook_activity')
      .select('*')
      .in('entry_id', entryIds);

    if (actErr) {
      console.error('Error fetching Ridwan activities:', actErr.message);
    } else {
      console.log(`📝 Total aktivitas Ridwan: ${ridwanActivities.length}`);
      // Group by entry_id
      const grouped = {};
      ridwanActivities.forEach(a => {
        if (!grouped[a.entry_id]) grouped[a.entry_id] = [];
        grouped[a.entry_id].push(a);
      });
      ridwanEntries.forEach(e => {
        const acts = grouped[e.id] || [];
        console.log(`   ${e.entry_date}: ${acts.length} aktivitas`);
        acts.forEach(a => console.log(`     • ${a.kegiatan} → ${a.output} (${a.volume} ${a.satuan})`));
      });
    }
  }

  console.log('\n--- STATUS SETIAP ANGGOTA ---\n');

  // 3. Check each member's logbook
  for (const member of KELOMPOK_56) {
    const { data: entries, error: err } = await supabase
      .from('logbook_entry')
      .select('id, nim, entry_date')
      .eq('nim', member.nim)
      .order('entry_date', { ascending: true });

    if (err) {
      console.log(`❌ ${member.name} (${member.nim}): ERROR - ${err.message}`);
      continue;
    }

    const count = entries ? entries.length : 0;
    const status = count === 0 ? '❌ KOSONG' : `✅ ${count} entry`;
    console.log(`${status} | ${member.name} (${member.nim})`);
    if (count > 0) {
      const dates = entries.map(e => e.entry_date);
      console.log(`         Tanggal: ${dates.join(', ')}`);
    }
  }
}

checkLogbookStatus().catch(console.error);
