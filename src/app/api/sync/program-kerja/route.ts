import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';

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

  // Set permission: siapapun dengan link bisa lihat
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  }).catch(e => console.error('[Drive] Gagal set permission publik:', e));

  return file.id;
}

// Buat URL untuk tampil & download dari Drive file ID atau DataURI tanpa error 404 Supabase Storage
function buildMediaUrls(fileId: string | null, base64Data: string, mimeType: string) {
  const isVideo = mimeType.startsWith('video/');
  
  if (fileId) {
    return {
      fileId,
      // Universal Direct Image/Thumbnail View URL (tidak perlu bucket Supabase)
      viewUrl: isVideo
        ? `https://drive.google.com/file/d/${fileId}/preview`
        : `https://lh3.googleusercontent.com/d/${fileId}`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
      type: isVideo ? 'video' : 'image'
    };
  }

  // Safe DataURI Fallback: jika Drive tidak merespons, gunakan DataURI langsung agar 100% tampil & bisa didownload
  return {
    fileId: null,
    viewUrl: base64Data,
    downloadUrl: base64Data,
    driveUrl: base64Data,
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
      console.warn('[Program Kerja Upload] Google Auth warning:', authErr.message);
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
          uploadedItem = buildMediaUrls(fileId, photoData, mimeType);
        } catch (driveErr: any) {
          console.warn(`[Program Kerja Upload] Drive upload warning (${driveErr.message}), beralih ke safe DataURI fallback...`);
        }
      }

      // 2. Safe Fallback DataURI jika Drive menolak
      if (!uploadedItem) {
        uploadedItem = buildMediaUrls(null, photoData, mimeType);
      }

      results.push(uploadedItem);
    }

    return NextResponse.json({
      success: true,
      urls: results,
      driveConfigured: true,
      message: `${results.length} media berhasil diproses`
    });

  } catch (err: any) {
    console.error('[Program Kerja Upload] Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal upload program kerja' }, { status: 500 });
  }
}
