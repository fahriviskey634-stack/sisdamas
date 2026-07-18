const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid needing dotenv
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  });
} catch (e) {
  console.log("Could not read .env.local file, using process.env");
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables", { supabaseUrl, supabaseAnonKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('logbook_entry')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error querying logbook_entry table:", error.message);
  } else {
    console.log("Success! logbook_entry table exists. Data:", data);
  }
}

test();
