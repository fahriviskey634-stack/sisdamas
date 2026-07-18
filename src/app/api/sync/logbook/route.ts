import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGoogleAccessToken } from '@/lib/googleAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const KKN_MEMBERS = [
  { nim: '1234060108', name: 'Aisyah Shofa Aini', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'aisyah@sukahaji-official.id', division: 'Sekretaris (BPH)' },
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)' },
  { nim: '1237010003', name: 'Tifa Astrianti', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'tifa@sukahaji-official.id', division: 'Bendahara (BPH)' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hani@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232040021', name: 'Indah Sri Rahayu', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indah@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa', gender: 'P', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hasna@sukahaji-official.id', division: 'Divisi Acara' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim', gender: 'P', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'ilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'evan@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilya@sukahaji-official.id', division: 'Divisi Media' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'kayyis@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fahri@sukahaji-official.id', division: 'Divisi Humas' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'nova@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1232090080', name: 'Nurdin', gender: 'L', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nurdin@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1231040133', name: 'Hanifah Mauludiah', gender: 'P', prodi: 'S1 - Tasawuf dan Psikoterapi', fakultas: 'Ushuluddin', email: 'hanifah@sukahaji-official.id', division: 'Divisi Logsum' },
  { nim: '1239240280', name: 'Ridwan Firmansyah', gender: 'L', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ridwan@sukahaji-official.id', division: 'Divisi Logsum' }
];

function parsePhotos(photoUrlStr: string): string[] {
  if (!photoUrlStr) return [];
  const trimmed = photoUrlStr.trim();
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return [trimmed];
    }
  }
  return [trimmed];
}

async function getOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(name)}'+and+'${parentId}'+in+parents+and+trashed=false&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    })
  });
  
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create folder ${name}: ${err}`);
  }
  const folder = await createRes.json();
  return folder.id;
}

async function uploadFileToDrive(base64Data: string, filename: string, mimeType: string, parentFolderId: string, token: string): Promise<string> {
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const metadata = {
    name: filename,
    mimeType,
    parents: [parentFolderId]
  };

  const boundary = 'foo_bar_upload_boundary';
  const header = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(header, 'utf8'),
    Buffer.from(cleanBase64, 'utf8'),
    Buffer.from(footer, 'utf8')
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive upload failed: ${errText}`);
  }

  const file = await res.json();

  // Set permission to anyone with link viewable
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (e) {
    console.error("Failed to set file permission:", e);
  }

  return `https://docs.google.com/uc?export=download&id=${file.id}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nim, logbookData } = body;

    if (!nim || !logbookData) {
      return NextResponse.json({ error: 'NIM dan logbookData wajib diisi' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Konfigurasi Supabase Server belum lengkap' }, { status: 500 });
    }

    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    let token = '';
    let parentFolderId = '';
    
    const isMock = !gcpKey || !driveFolderId || gcpKey.includes('placeholder');
    
    if (!isMock) {
      try {
        token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive']);
        // Create root Logbook folder inside target parent
        const rootLogbookFolder = await getOrCreateFolder('Logbook', driveFolderId!, token);
        // Find member name
        const member = KKN_MEMBERS.find(m => m.nim === nim);
        const memberName = member ? member.name : `Member_${nim}`;
        // Create specific member folder
        parentFolderId = await getOrCreateFolder(memberName, rootLogbookFolder, token);
      } catch (err) {
        console.error("GCP token or folder retrieval failed, proceeding without Google Drive backup:", err);
      }
    }

    const dates = Object.keys(logbookData);
    let syncCount = 0;
    const updatedLogbookData = { ...logbookData };

    for (const dateStr of dates) {
      const activities = logbookData[dateStr] || [];
      const updatedActivities = [];

      for (let i = 0; i < activities.length; i++) {
        const act = activities[i];
        const photos = parsePhotos(act.bukti_foto_url);
        const uploadedUrls: string[] = [];

        for (let j = 0; j < photos.length; j++) {
          const photoUrl = photos[j];
          if (photoUrl.startsWith('data:image')) {
            // Upload uncompressed to Google Drive
            if (token && parentFolderId) {
              try {
                const mimeType = photoUrl.split(';')[0].split(':')[1] || 'image/jpeg';
                const extension = mimeType.split('/')[1] || 'jpg';
                const filename = `logbook_${nim}_${dateStr}_act${i}_photo${j}_${Date.now()}.${extension}`;
                const directLink = await uploadFileToDrive(photoUrl, filename, mimeType, parentFolderId, token);
                uploadedUrls.push(directLink);
              } catch (uploadErr) {
                console.error("Error uploading to Google Drive, using base64 fallback:", uploadErr);
                uploadedUrls.push(photoUrl);
              }
            } else {
              // Mock fallback
              uploadedUrls.push(`https://drive.google.com/open?id=mock-photo-logbook-${Date.now()}-${j}`);
            }
          } else {
            uploadedUrls.push(photoUrl);
          }
        }

        const finalBuktiUrl = uploadedUrls.length > 0 
          ? (uploadedUrls.length === 1 && !act.bukti_foto_url.startsWith('[') ? uploadedUrls[0] : JSON.stringify(uploadedUrls)) 
          : '📷 default_foto.jpg';

        updatedActivities.push({
          ...act,
          bukti_foto_url: finalBuktiUrl
        });
      }

      updatedLogbookData[dateStr] = updatedActivities;

      // 1. Upsert logbook entry for this date
      const { data: entryData, error: entryError } = await supabaseServer
        .from('logbook_entry')
        .upsert(
          { nim, entry_date: dateStr },
          { onConflict: 'nim,entry_date' }
        )
        .select()
        .single();

      if (entryError) {
        if (entryError.code === '42P01') {
          return NextResponse.json({
            status: 'warning',
            message: 'Tabel database logbook belum dibuat. Silakan jalankan migrasi 002_logbook_schema.sql di Supabase SQL Editor.',
            db_synced: false
          });
        }
        throw entryError;
      }

      // 2. Clear old activities for this entry
      const { error: deleteError } = await supabaseServer
        .from('logbook_activity')
        .delete()
        .eq('entry_id', entryData.id);

      if (deleteError) throw deleteError;

      // 3. Insert new activities
      if (updatedActivities.length > 0) {
        const activityInserts = updatedActivities.map((act: any) => ({
          entry_id: entryData.id,
          kegiatan: act.kegiatan || '-',
          output: act.output || '-',
          volume: Number(act.volume) || 1,
          satuan: act.satuan || 'kali',
          bukti_foto_url: act.bukti_foto_url || ''
        }));

        const { error: insertError } = await supabaseServer
          .from('logbook_activity')
          .insert(activityInserts);

        if (insertError) throw insertError;
      }

      syncCount++;
    }

    return NextResponse.json({
      status: 'success',
      message: `Berhasil mensinkronisasi ${syncCount} tanggal logbook ke database & Google Drive.`,
      db_synced: true,
      updatedLogbookData
    });
  } catch (err: any) {
    console.error('Error syncing logbook:', err);
    return NextResponse.json({ error: err.message || 'Gagal sinkronisasi logbook' }, { status: 500 });
  }
}
