import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';

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
    const { photos } = body;

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 });
    }

    const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!gcpKey || !driveFolderId || gcpKey.includes('placeholder')) {
      const mockUrls = photos.map((_, index) => `https://drive.google.com/open?id=mock-photo-prog-${Date.now()}-${index}`);
      return NextResponse.json({ urls: mockUrls });
    }

    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive']);
    const parentFolderId = await getOrCreateFolder('Program Kerja', driveFolderId, token);

    const urls = [];
    for (let i = 0; i < photos.length; i++) {
      const photoUrl = photos[i];
      if (photoUrl.startsWith('data:image')) {
        const mimeType = photoUrl.split(';')[0].split(':')[1] || 'image/jpeg';
        const extension = mimeType.split('/')[1] || 'jpg';
        const filename = `program_kerja_${Date.now()}_${i}.${extension}`;
        const directUrl = await uploadFileToDrive(photoUrl, filename, mimeType, parentFolderId, token);
        urls.push(directUrl);
      } else {
        urls.push(photoUrl);
      }
    }

    return NextResponse.json({ urls });
  } catch (err: any) {
    console.error("Error in program-kerja sync:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
