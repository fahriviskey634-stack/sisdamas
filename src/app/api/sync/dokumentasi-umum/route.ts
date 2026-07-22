import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';

async function getOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
  const searchUrl = `https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&supportsAllDrives=true&supportsTeamDrives=true&q=mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(name)}'+and+'${parentId}'+in+parents+and+trashed=false&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&supportsTeamDrives=true', {
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

async function uploadFileToDrive(base64Data: string, filename: string, mimeType: string, parentFolderId: string, token: string): Promise<{ viewUrl: string; downloadUrl: string; driveUrl: string }> {
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const binaryBuffer = Buffer.from(cleanBase64, 'base64');
  const metadata = {
    name: filename,
    mimeType,
    parents: [parentFolderId]
  };

  const boundary = `kkn56_dok_upload_${Date.now()}`;
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
    throw new Error(`Google Drive upload failed (${res.status}): ${errText}`);
  }

  const file = await res.json();

  // Set permission to anyone with link viewable
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
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

  const isVideo = mimeType.startsWith('video/');

  return {
    viewUrl: isVideo ? `https://drive.google.com/file/d/${file.id}/preview` : `https://lh3.googleusercontent.com/d/${file.id}=s1600`,
    downloadUrl: `https://docs.google.com/uc?export=download&id=${file.id}`,
    driveUrl: `https://drive.google.com/file/d/${file.id}/view`
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { galleryName, photos } = body;

    if (!galleryName || !photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
    }

    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1AWDLdZtiBnF4hanW9wXuNdBqmlrz2ErB';

    let token: string | null = null;
    let targetFolderId: string | null = null;

    // 1. Indonesian Date Formatting
    const date = new Date();
    const indMonths = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dateFormatted = `${date.getDate()} ${indMonths[date.getMonth()]} ${date.getFullYear()}`;
    const folderTitle = `${dateFormatted} - ${galleryName}`;

    try {
      token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive']);
      if (token) {
        const rootDokumentasiFolder = await getOrCreateFolder('Dokumentasi', driveFolderId, token);
        targetFolderId = await getOrCreateFolder(folderTitle, rootDokumentasiFolder, token);
      }
    } catch (authErr: any) {
      console.warn('[Galeri Foto Upload] Google Auth warning:', authErr.message);
    }

    const urls = [];
    for (let i = 0; i < photos.length; i++) {
      const photoUrl = photos[i];
      if (typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
        const mimeType = photoUrl.split(';')[0].split(':')[1] || 'image/jpeg';
        const isVideo = mimeType.startsWith('video/');
        const extension = isVideo ? (mimeType.split('/')[1] || 'mp4') : (mimeType.split('/')[1] || 'jpg');
        const filename = `dok_${galleryName.replace(/\s+/g, '_')}_${Date.now()}_${i}.${extension}`;

        if (token && targetFolderId) {
          try {
            const fileObj = await uploadFileToDrive(photoUrl, filename, mimeType, targetFolderId, token);
            urls.push({
              ...fileObj,
              type: isVideo ? 'video' : 'image'
            });
            continue;
          } catch (uploadErr: any) {
            console.error('[Galeri Foto Upload] Google Drive file upload error:', uploadErr.message);
          }
        }

        // Safe Fallback: jika Drive API gagal/offline, gunakan DataURI langsung agar 100% tampil & bisa didownload
        urls.push({
          viewUrl: photoUrl,
          downloadUrl: photoUrl,
          driveUrl: photoUrl,
          type: isVideo ? 'video' : 'image'
        });
      } else {
        urls.push(photoUrl);
      }
    }

    return NextResponse.json({ urls, dateString: dateFormatted, folderName: folderTitle });
  } catch (err: any) {
    console.error("Error in PDD dokumentasi sync:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
