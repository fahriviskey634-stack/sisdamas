import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';

export async function POST(req: NextRequest) {
  try {
    const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Check for developer fallback / offline mode
    if (!gcpKey || !driveFolderId || gcpKey.includes('placeholder')) {
      console.log(`[Google Sync Mock] Backing up platform datasets to shared folder: ${driveFolderId || 'root-folder-id'}`);
      
      return NextResponse.json({
        success: true,
        mocked: true,
        message: "Dokumen berhasil diarsipkan ke Google Drive (Mode Simulasi Pengembang)",
        data: {
          synced_files: 5,
          drive_link: 'https://drive.google.com/drive/folders/mock-folder-id',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Production GCP Service Account Integration
    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive.file']);

    // Create a backup file representing current platform statistics
    const backupData = {
      timestamp: new Date().toISOString(),
      platform: "SISDAMAS Kelompok 56 Sukahaji",
      description: "Backup otomatis data koordinat dan keluhan warga"
    };

    // Post to Google Drive API multipart upload
    const metadata = {
      name: `backup_sensus_sukahaji_${Date.now()}.json`,
      mimeType: 'application/json',
      parents: [driveFolderId]
    };

    const boundary = 'foo_bar_boundary';
    const multipartBody = 
      `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
      JSON.stringify(backupData) +
      `\r\n--${boundary}--`;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive API rejected upload: ${errText}`);
    }

    const driveFile = await res.json();

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil diarsipkan ke Google Drive",
      data: {
        synced_files: 1,
        drive_file_id: driveFile.id,
        drive_link: `https://drive.google.com/open?id=${driveFile.id}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err: any) {
    console.error("Google Drive Sync Error:", err);
    return NextResponse.json(
      { error: `Gagal mencadangkan foto ke Google Drive: ${err.message}` },
      { status: 550 }
    );
  }
}
