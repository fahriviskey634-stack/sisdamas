import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kqosoqwaapldnuiehbim.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxb3NvcXdhYXBsZG51aWVoYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDAyMTk0MSwiZXhwIjoyMDk5NTk3OTQxfQ.b53opTBfxg2tcOKbFueHC2Bt6w5qAcFiz6TXEJTj0XU',
  { auth: { persistSession: false } }
);

// Try creating tables by inserting a test then checking errors
async function checkAndMigrate() {
  console.log('Checking if logbook tables exist...');
  
  // Check logbook_entry
  const { error: checkError } = await supabase
    .from('logbook_entry')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.log('Table logbook_entry does not exist:', checkError.message);
    console.log('\n=== SOLUSI ===');
    console.log('Jalankan SQL ini di Supabase SQL Editor (https://app.supabase.com):');
    console.log('Project: kqosoqwaapldnuiehbim');
    console.log('Menu: SQL Editor > New Query\n');
    console.log(`
CREATE TABLE IF NOT EXISTS logbook_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nim VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(nim, entry_date)
);

CREATE TABLE IF NOT EXISTS logbook_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES logbook_entry(id) ON DELETE CASCADE,
    kegiatan TEXT NOT NULL,
    output TEXT NOT NULL,
    volume INTEGER NOT NULL DEFAULT 1,
    satuan VARCHAR(50) NOT NULL DEFAULT 'kali',
    bukti_foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logbook_entry_nim_date ON logbook_entry(nim, entry_date);
CREATE INDEX IF NOT EXISTS idx_logbook_activity_entry_id ON logbook_activity(entry_id);
`);
  } else {
    console.log('Table logbook_entry EXISTS!');
    
    const { data: entries, error: eErr } = await supabase
      .from('logbook_entry')
      .select('nim, entry_date')
      .order('entry_date', { ascending: false })
      .limit(5);
    
    console.log('Recent entries:', JSON.stringify(entries, null, 2));
    if (eErr) console.log('Error fetching entries:', eErr.message);
    
    const { data: acts, error: aErr } = await supabase
      .from('logbook_activity')
      .select('entry_id, kegiatan, output')
      .limit(5);
    
    console.log('Recent activities:', JSON.stringify(acts, null, 2));
    if (aErr) console.log('Error fetching activities:', aErr.message);
  }
}

checkAndMigrate().catch(console.error);
