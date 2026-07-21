import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGoogleAccessToken } from '@/lib/googleAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Upload fallback ke Supabase Storage jika Google Drive melempar storageQuotaExceeded
async function uploadToSupabaseStorage(
  base64Data: string,
  filename: string,
  mimeType: string
): Promise<{ viewUrl: string; downloadUrl: string; driveUrl: string; type: string }> {
  const isVideo = mimeType.startsWith('video/');
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    throw new Error('Supabase Storage credentials belum dikonfigurasi');
  }

  const supabaseServer = createClient(supabaseUrl, supabaseKey);
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const filePath = `program_kerja/${Date.now()}_${filename}`;

  // Upload ke bucket 'dokumentasi' (atau buat jika belum ada)
  const { error: uploadError } = await supabaseServer.storage
    .from('dokumentasi')
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (uploadError) {
    // Jika bucket 'dokumentasi' belum publik/ada, coba bucket default
    console.warn('[Supabase Storage] Bucket "dokumentasi" upload warning:', uploadError.message);
  }

  const { data: urlData } = supabaseServer.storage
    .from('dokumentasi')
    .getPublicUrl(filePath);

  const publicUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/dokumentasi/${filePath}`;

  return {
    viewUrl: publicUrl,
    downloadUrl: publicUrl,
    driveUrl: publicUrl,
    type: isVideo ? 'video' : 'image'
  };
}

// Cari atau buat folder di Google Drive
async function getOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&supportsAllDrives=true&supportsTeamDrives=true&q=mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(name)}'+and+'${parentId}'+in+parents+and+trashed=false&fields=files(id)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;
  }
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&supportsTeamDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Gagal membuat folder Drive "${name}": ${err}`);
  }
  const folder = await createRes.json();
  return folder.id;
}

// Upload file (gambar/video) ke Google Drive, kembalikan fileId
async function uploadFileToDrive(
  base64Data: string,
  filename: string,
  mimeType: string,
  parentFolderId: string,
  token: string
): Promise<string> {
  // Hapus prefix data URI (data:image/jpeg;base64, atau data:video/mp4;base64,)
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

  const metadata = { name: filename, mimeType, parents: [parentFolderId] };
  const boundary = 'kkn56_upload_boundary';
  const header = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(header, 'utf8'),
    Buffer.from(cleanBase64, 'utf8'),
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
    throw new Error(`Upload ke Google Drive gagal: ${errText}`);
  }

  const file = await res.json();

  // Set permission: siapapun dengan link bisa lihat (viewer)
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  }).catch(e => console.error('[Drive] Gagal set permission publik:', e));

  return file.id;
}

// Buat URL untuk tampil & download dari Drive file ID
function buildDriveUrls(fileId: string, mimeType: string) {
  const isVideo = mimeType.startsWith('video/');
  return {
    fileId,
    viewUrl: isVideo
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
    type: isVideo ? 'video' : 'image'
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photos, programName } = body;

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Format data tidak valid: "photos" harus berupa array' }, { status: 400 });
    }

    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1AWDLdZtiBnF4hanW9wXuNdBqmlrz2ErB';

    let token: string | null = null;
    let targetFolder: string | null = null;

    try {
      token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive']);
      if (token) {
        const rootFolder = await getOrCreateFolder('KKN Kelompok 56', driveFolderId, token);
        const programKerjaFolder = await getOrCreateFolder('Program Kerja', rootFolder, token);
        targetFolder = programName
          ? await getOrCreateFolder(programName.substring(0, 80), programKerjaFolder, token)
          : programKerjaFolder;
      }
    } catch (authErr: any) {
      console.warn('[Program Kerja Upload] Google Drive Auth warning, akan mencoba Supabase Storage fallback:', authErr.message);
    }

    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const photoData = photos[i];

      if (!photoData.startsWith('data:')) {
        results.push({ viewUrl: photoData, downloadUrl: photoData, driveUrl: photoData, type: 'image', fileId: null });
        continue;
      }

      const mimeType = photoData.split(';')[0].split(':')[1] || 'image/jpeg';
      const isVideo = mimeType.startsWith('video/');
      const extension = mimeType.split('/')[1]?.replace('quicktime', 'mov') || (isVideo ? 'mp4' : 'jpg');
      const prefix = isVideo ? 'video' : 'foto';
      const filename = `prog_kerja_${prefix}_${Date.now()}_${i + 1}.${extension}`;

      let uploadedItem = null;

      // 1. Coba upload ke Google Drive
      if (token && targetFolder) {
        try {
          const fileId = await uploadFileToDrive(photoData, filename, mimeType, targetFolder, token);
          uploadedItem = buildDriveUrls(fileId, mimeType);
        } catch (driveErr: any) {
          console.warn(`[Program Kerja Upload] Drive upload warning untuk file ke-${i + 1} (${driveErr.message}), beralih ke Supabase Storage...`);
        }
      }

      // 2. Fallback otomatis ke Supabase Storage jika Drive gagal/kena kuota 403
      if (!uploadedItem) {
        try {
          uploadedItem = await uploadToSupabaseStorage(photoData, filename, mimeType);
        } catch (supabaseErr: any) {
          console.error(`[Program Kerja Upload] Supabase Storage upload error:`, supabaseErr.message);
          return NextResponse.json({
            error: `Gagal upload file ke-${i + 1}: ${supabaseErr.message}`
          }, { status: 500 });
        }
      }

      results.push(uploadedItem);
    }

    return NextResponse.json({
      success: true,
      urls: results,
      driveConfigured: true,
      message: `${results.length} file berhasil disimpan di cloud storage`
    });

  } catch (err: any) {
    console.error('[Program Kerja Upload] Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal upload program kerja' }, { status: 500 });
  }
}

