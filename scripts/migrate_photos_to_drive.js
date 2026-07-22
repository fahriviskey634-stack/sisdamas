const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1AWDLdZtiBnF4hanW9wXuNdBqmlrz2ErB';

async function getAccessToken() {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get OAuth access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

async function getOrCreateFolder(name, parentId, token) {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&supportsAllDrives=true&supportsTeamDrives=true&q=mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(name)}'+and+'${parentId}'+in+parents+and+trashed=false&fields=files(id)`;
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;
  }
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&supportsTeamDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
  });
  const folder = await createRes.json();
  return folder.id;
}

async function uploadFileToDrive(base64Data, filename, parentFolderId, token) {
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const binaryBuffer = Buffer.from(cleanBase64, 'base64');
  const mimeType = base64Data.split(';')[0].split(':')[1] || 'image/jpeg';

  const metadata = { name: filename, mimeType, parents: [parentFolderId] };
  const boundary = `kkn56_migrate_${Date.now()}`;
  const part1Header = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const part2Header = `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(part1Header, 'utf8'),
    Buffer.from(part2Header, 'utf8'),
    binaryBuffer,
    Buffer.from(footer, 'utf8')
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&supportsTeamDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive Upload Error (${res.status}): ${err}`);
  }

  const file = await res.json();

  // Set permission to anyone
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  }).catch(() => {});

  const isVideo = mimeType.startsWith('video/');
  return {
    fileId: file.id,
    viewUrl: isVideo ? `https://drive.google.com/file/d/${file.id}/preview` : `https://lh3.googleusercontent.com/d/${file.id}`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
    type: isVideo ? 'video' : 'image'
  };
}

async function migrateAll() {
  console.log("=== STARTING PHOTO MIGRATION TO GOOGLE DRIVE ===");
  const token = await getAccessToken();
  console.log("OAuth token retrieved successfully!");

  // 1. Migrate Program Kerja Photos (table: 'program')
  console.log("\n--- Checking Program Kerja (table: 'program') ---");
  const { data: programs, error: progErr } = await supabase.from('program').select('*');
  if (progErr) {
    console.log("Program table info:", progErr.message);
  } else if (programs && programs.length > 0) {
    console.log(`Found ${programs.length} program kerja records in Supabase database.`);
    const rootProgFolder = await getOrCreateFolder('Program Kerja', driveFolderId, token);
    let count = 0;

    for (const prog of programs) {
      let photos = prog.photo_urls || [];
      if (typeof photos === 'string') {
        try { photos = JSON.parse(photos); } catch { photos = [photos]; }
      }
      let updated = false;
      const newPhotoList = [];

      const targetFolder = await getOrCreateFolder(prog.name ? prog.name.substring(0, 80) : 'Program', rootProgFolder, token);

      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];
        const rawUrl = typeof item === 'string' ? item : (item.viewUrl || item.driveUrl || '');
        if (rawUrl && rawUrl.includes('data:')) {
          console.log(`Migrating Program Kerja "${prog.name}" photo #${i + 1}...`);
          const mimeType = rawUrl.split(';')[0].split(':')[1] || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          const filename = `prog_${prog.id}_photo_${i + 1}_${Date.now()}.${ext}`;
          const driveMedia = await uploadFileToDrive(rawUrl, filename, targetFolder, token);
          newPhotoList.push(driveMedia);
          updated = true;
        } else {
          newPhotoList.push(item);
        }
      }

      if (updated) {
        await supabase
          .from('program')
          .update({ photo_urls: newPhotoList })
          .eq('id', prog.id);
        count++;
        console.log(`SUCCESS: Updated Program Kerja "${prog.name}" with Drive media URLs!`);
      }
    }
    console.log(`Migrated ${count} Program Kerja photo sets to Google Drive.`);
  }

  // 2. Migrate Logbook Activities
  console.log("\n--- Checking Logbook Activities ---");
  const { data: logbookActivities, error: lbErr } = await supabase.from('logbook_activity').select('*');
  if (lbErr) {
    console.log("Logbook table info:", lbErr.message);
  } else if (logbookActivities && logbookActivities.length > 0) {
    const rootLogbookFolder = await getOrCreateFolder('Logbook', driveFolderId, token);
    let count = 0;
    for (const act of logbookActivities) {
      if (act.bukti_foto_url && act.bukti_foto_url.includes('data:image')) {
        console.log(`Migrating logbook activity ID ${act.id}...`);
        const mimeType = act.bukti_foto_url.split(';')[0].split(':')[1] || 'image/jpeg';
        const ext = mimeType.split('/')[1] || 'jpg';
        const filename = `logbook_act_${act.id}_${Date.now()}.${ext}`;
        const driveMedia = await uploadFileToDrive(act.bukti_foto_url, filename, rootLogbookFolder, token);
        
        await supabase
          .from('logbook_activity')
          .update({ bukti_foto_url: driveMedia.viewUrl })
          .eq('id', act.id);

        count++;
        console.log(`Logbook activity ${act.id} migrated -> ${driveMedia.viewUrl}`);
      }
    }
    console.log(`Migrated ${count} logbook photos to Google Drive.`);
  }

  // 3. Migrate Household Photos (Sensus)
  console.log("\n--- Checking Household Photos (Sensus) ---");
  const { data: hhPhotos, error: hhErr } = await supabase.from('household_photo').select('*');
  if (hhErr) {
    console.log("Household photo info:", hhErr.message);
  } else if (hhPhotos && hhPhotos.length > 0) {
    const rootDokumentasiFolder = await getOrCreateFolder('Dokumentasi', driveFolderId, token);
    let count = 0;
    for (const photo of hhPhotos) {
      if (photo.storage_url && photo.storage_url.includes('data:image')) {
        console.log(`Migrating household photo ID ${photo.id}...`);
        const mimeType = photo.storage_url.split(';')[0].split(':')[1] || 'image/jpeg';
        const ext = mimeType.split('/')[1] || 'jpg';
        const filename = `sensus_household_${photo.household_id}_${Date.now()}.${ext}`;
        const driveMedia = await uploadFileToDrive(photo.storage_url, filename, rootDokumentasiFolder, token);

        await supabase
          .from('household_photo')
          .update({ storage_url: driveMedia.downloadUrl })
          .eq('id', photo.id);

        count++;
        console.log(`Household photo ${photo.id} migrated -> ${driveMedia.downloadUrl}`);
      }
    }
    console.log(`Migrated ${count} sensus photos to Google Drive.`);
  }

  console.log("\n=== MIGRATION TO GOOGLE DRIVE COMPLETED SUCCESSFULLY ===");
}

migrateAll().catch(err => console.error("Migration Error:", err));
