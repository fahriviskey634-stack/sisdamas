import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGoogleAccessToken } from '@/lib/googleAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const KKN_MEMBERS = [
  // --- KELOMPOK 55 ---
  { nim: '1235030147', name: 'Muhammad Al Afgani', gender: 'L', prodi: 'S1 - Sastra Inggris', fakultas: 'Adab dan Humaniora', email: 'alafgani@sukahaji-official.id', division: 'Ketua (BPH)', group: '55', dusun: 'Dusun 2' },
  { nim: '1231060051', name: 'Agi bill Busyro dalimunthe', gender: 'L', prodi: 'S1 - Ilmu Hadits', fakultas: 'Ushuluddin', email: 'agi@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1239230140', name: 'Ersa Sofwatul Atqiyya', gender: 'P', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ersa@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1237050038', name: 'Fawwaz fadel rahman', gender: 'L', prodi: 'S1 - Teknik Informatika', fakultas: 'Sains dan Teknologi', email: 'fawwaz@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1235060068', name: 'Hana Farah Qurrotu Aini', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hana@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1239240124', name: 'Jasmine Fakhirah Rahadiani', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'jasmine@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1233010095', name: 'Muhammad Akbar Ilham Zaki', gender: 'L', prodi: 'S1 - Hukum Keluarga', fakultas: 'Syariah dan Hukum', email: 'akbar@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1234040037', name: 'Najla Khayyarah', gender: 'P', prodi: 'S1 - Pengembangan Masyarakat Islam', fakultas: 'Dakwah dan Komunikasi', email: 'najla@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1234010088', name: 'Nida Rahmawati Salsabila', gender: 'P', prodi: 'S1 - Bimbingan Konseling Islam', fakultas: 'Dakwah dan Komunikasi', email: 'nida@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1232100016', name: 'Nisa Azkiya Rahmy', gender: 'P', prodi: 'S1 - Pendidikan Islam Anak Usia Dini', fakultas: 'Tarbiyah dan Keguruan', email: 'nisa@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1232090121', name: 'Nur Rahmadani Fadillah', gender: 'P', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nur@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1238030110', name: 'Rafi Achmad', gender: 'L', prodi: 'S1 - Sosiologi', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'rafi@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1233060115', name: 'Syarif Mukhtar', gender: 'L', prodi: 'S1 - Hukum Pidana Islam', fakultas: 'Syariah dan Hukum', email: 'syarif@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  { nim: '1237060043', name: 'Zaina Izdihar Zahira', gender: 'P', prodi: 'S1 - Agroteknologi', fakultas: 'Sains dan Teknologi', email: 'zaina@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 2' },
  // --- KELOMPOK 56 ---
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)', group: '56', dusun: 'Dusun 2' },
  { nim: '1234060108', name: 'Aisyah Shofa Aini', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'aisyah@sukahaji-official.id', division: 'Sekretaris (BPH)', group: '56', dusun: 'Dusun 2' },
  { nim: '1237010003', name: 'Tifa Astrianti', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'tifa@sukahaji-official.id', division: 'Bendahara (BPH)', group: '56', dusun: 'Dusun 2' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hani@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1232040021', name: 'Indah Sri Rahayu', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indah@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa', gender: 'P', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hasna@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim', gender: 'P', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'ilya@sukahaji-official.id', division: 'Divisi Media', group: '56', dusun: 'Dusun 2' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'evan@sukahaji-official.id', division: 'Divisi Media', group: '56', dusun: 'Dusun 2' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilya@sukahaji-official.id', division: 'Divisi Media', group: '56', dusun: 'Dusun 2' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'kayyis@sukahaji-official.id', division: 'Divisi Humas', group: '56', dusun: 'Dusun 2' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fahri@sukahaji-official.id', division: 'Divisi Humas', group: '56', dusun: 'Dusun 2' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'nova@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1232090080', name: 'Nurdin', gender: 'L', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nurdin@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1231040133', name: 'Hanifah Mauludiah', gender: 'P', prodi: 'S1 - Tasawuf dan Psikoterapi', fakultas: 'Ushuluddin', email: 'hanifah@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1239240280', name: 'Ridwan Firmansyah', gender: 'L', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ridwan@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  // --- KELOMPOK 57 ---
  { nim: '1232050134', name: 'Hilman Farid', gender: 'L', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hilman@sukahaji-official.id', division: 'Ketua (BPH)', group: '57', dusun: 'Dusun 1' },
  { nim: '1234060095', name: 'Ajeng Dwi Meilianie', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'ajeng@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1231030032', name: 'Arya Ridwan Alfarisy', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arya@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1239230222', name: 'Fadhil Muhammad Yasir', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'fadhil@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1237030032', name: 'Fariel Rivaldi', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fariel@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1235060007', name: 'Hanum Alya Salsabila', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hanum@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1235020128', name: 'Hilya Sakinah Najah', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilyanajah@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1232040161', name: 'Indira Rahma Fatika', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indira@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1238010147', name: 'Jembar Budi Sampurna', gender: 'L', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'jembar@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1239240092', name: 'Khaira Almaratu Assyafa', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'khaira@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1235010148', name: 'Neng Popi Pitria Putri', gender: 'P', prodi: 'S1 - Sejarah dan Peradaban Islam', fakultas: 'Adab dan Humaniora', email: 'nengpopi@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1232090177', name: 'Nuri Fauziyah', gender: 'P', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nuri@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1236000111', name: 'Olivia Agustina Dwiyanti', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'olivia@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
  { nim: '1237010008', name: 'Umayyah Syihab', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'umayyah@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 1' },
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
  // Strip semua data URI prefix: data:image/jpeg;base64, atau data:video/mp4;base64,
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const binaryBuffer = Buffer.from(cleanBase64, 'base64');

  const metadata = {
    name: filename,
    mimeType,
    parents: [parentFolderId]
  };

  const boundary = `kkn56_logbook_upload_${Date.now()}`;
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
    const errText = await res.text();
    throw new Error(`Google Drive upload gagal (${res.status}): ${errText}`);
  }

  const file = await res.json();

  // Set permission: siapapun dengan link bisa lihat
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });

  } catch (e) {
    console.error('[Logbook] Gagal set permission Drive:', e);
  }

  // Kembalikan thumbnail URL (untuk display <img>) bukan download URL
  return `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`;
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
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1AWDLdZtiBnF4hanW9wXuNdBqmlrz2ErB';
    
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
            // Upload ke Google Drive — TIDAK simpan base64 ke storage
            if (token && parentFolderId) {
              try {
                const mimeType = photoUrl.split(';')[0].split(':')[1] || 'image/jpeg';
                const extension = mimeType.split('/')[1] || 'jpg';
                const filename = `logbook_${nim}_${dateStr}_act${i}_photo${j}_${Date.now()}.${extension}`;
                // Kembalikan Drive thumbnail viewUrl
                const viewUrl = await uploadFileToDrive(photoUrl, filename, mimeType, parentFolderId, token);
                uploadedUrls.push(viewUrl);
              } catch (uploadErr) {
                console.error('[Logbook] Upload ke Drive gagal, foto dilewati:', uploadErr);
                // TIDAK simpan base64 — lempar error agar user tahu
                throw new Error(`Gagal upload foto ke Google Drive. Pastikan Service Account sudah dikonfigurasi dan folder Drive sudah di-share.`);
              }
            } else {
              // Drive belum dikonfigurasi — tolak, jangan simpan base64
              throw new Error('Google Drive belum dikonfigurasi. Foto tidak dapat diupload. Silakan hubungi administrator.');
            }
          } else {
            // Sudah berupa Drive URL (foto lama) — pertahankan
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
