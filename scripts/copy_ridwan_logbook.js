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

// Kelompok 56 members (tanpa Ridwan)
const KELOMPOK_56_OTHERS = [
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
];

const RIDWAN_NIM = '1239240280';

async function copyRidwanLogbooks() {
  console.log('=== COPY LOGBOOK RIDWAN KE SEMUA ANGGOTA KELOMPOK 56 ===\n');

  // 1. Get all Ridwan's logbook entries with activities
  const { data: ridwanEntries, error: ridwanErr } = await supabase
    .from('logbook_entry')
    .select('id, nim, entry_date')
    .eq('nim', RIDWAN_NIM)
    .order('entry_date', { ascending: true });

  if (ridwanErr) {
    console.error('Error fetching Ridwan entries:', ridwanErr.message);
    return;
  }

  console.log(`📋 Ridwan punya ${ridwanEntries.length} entry logbook\n`);

  // Get all Ridwan's activities
  const entryIds = ridwanEntries.map(e => e.id);
  const { data: ridwanActivities, error: actErr } = await supabase
    .from('logbook_activity')
    .select('*')
    .in('entry_id', entryIds);

  if (actErr) {
    console.error('Error fetching Ridwan activities:', actErr.message);
    return;
  }

  // Group activities by entry_id
  const activitiesByEntry = {};
  ridwanActivities.forEach(a => {
    if (!activitiesByEntry[a.entry_id]) activitiesByEntry[a.entry_id] = [];
    activitiesByEntry[a.entry_id].push(a);
  });

  // Build date -> activities map from Ridwan
  const ridwanDateMap = {};
  ridwanEntries.forEach(entry => {
    ridwanDateMap[entry.entry_date] = activitiesByEntry[entry.id] || [];
  });

  const ridwanDates = Object.keys(ridwanDateMap);
  console.log(`📅 Tanggal Ridwan: ${ridwanDates.join(', ')}\n`);

  let totalInserted = 0;

  // 2. For each member, find missing dates and insert
  for (const member of KELOMPOK_56_OTHERS) {
    console.log(`\n--- ${member.name} (${member.nim}) ---`);

    // Get existing dates for this member
    const { data: existingEntries, error: existErr } = await supabase
      .from('logbook_entry')
      .select('entry_date')
      .eq('nim', member.nim);

    if (existErr) {
      console.error(`  ❌ Error fetching: ${existErr.message}`);
      continue;
    }

    const existingDates = new Set(existingEntries.map(e => e.entry_date));
    const missingDates = ridwanDates.filter(d => !existingDates.has(d));

    if (missingDates.length === 0) {
      console.log(`  ✅ Sudah lengkap (${existingDates.size} entry, tidak ada yang kosong)`);
      continue;
    }

    console.log(`  📊 Sudah ada: ${existingDates.size} tanggal`);
    console.log(`  📋 Akan ditambahkan: ${missingDates.length} tanggal kosong`);
    console.log(`     ${missingDates.join(', ')}`);

    // Insert missing logbook entries + activities
    for (const dateStr of missingDates) {
      // Insert logbook_entry
      const { data: newEntry, error: insertErr } = await supabase
        .from('logbook_entry')
        .insert({ nim: member.nim, entry_date: dateStr })
        .select()
        .single();

      if (insertErr) {
        console.error(`  ❌ Error inserting entry ${dateStr}: ${insertErr.message}`);
        continue;
      }

      // Copy activities from Ridwan (without id and entry_id)
      const ridwanActs = ridwanDateMap[dateStr];
      if (ridwanActs && ridwanActs.length > 0) {
        const newActivities = ridwanActs.map(act => ({
          entry_id: newEntry.id,
          kegiatan: act.kegiatan,
          output: act.output,
          volume: act.volume,
          satuan: act.satuan,
          bukti_foto_url: act.bukti_foto_url || ''
        }));

        const { error: actInsertErr } = await supabase
          .from('logbook_activity')
          .insert(newActivities);

        if (actInsertErr) {
          console.error(`  ❌ Error inserting activities for ${dateStr}: ${actInsertErr.message}`);
          continue;
        }
      }

      totalInserted++;
    }

    console.log(`  ✅ Berhasil menambahkan ${missingDates.length} tanggal!`);
  }

  console.log(`\n\n🎉 SELESAI! Total ${totalInserted} logbook entry ditambahkan.`);
}

copyRidwanLogbooks().catch(console.error);
