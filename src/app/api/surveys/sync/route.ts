import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getGoogleAccessToken } from '@/lib/googleAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

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

async function uploadPhotoToGoogleDrive(photoBase64: string, filename: string, surveyorId: string): Promise<string> {
  const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!gcpKey || !driveFolderId || gcpKey.includes('placeholder')) {
    console.log(`[Google Drive Photo Upload Mock] Uploading ${filename} to folder ${driveFolderId || 'root'}`);
    return `https://drive.google.com/open?id=mock-photo-${Date.now()}`;
  }

  try {
    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/drive']);
    const base64Data = photoBase64.replace(/^data:[^;]+;base64,/, '');
    const binaryBuffer = Buffer.from(base64Data, 'base64');

    // Get or create root Dokumentasi folder inside target parent
    const rootDokumentasiFolder = await getOrCreateFolder('Dokumentasi', driveFolderId, token);
    
    // Find surveyor name for folder mapping
    const member = KKN_MEMBERS.find(m => m.nim === surveyorId);
    const folderName = member ? member.name : `Surveyor_${surveyorId}`;
    
    // Get or create sub-folder under Dokumentasi
    const targetFolderId = await getOrCreateFolder(folderName, rootDokumentasiFolder, token);

    // Extract correct MIME type
    const mimeType = photoBase64.split(';')[0].split(':')[1] || 'image/jpeg';

    const metadata = {
      name: filename,
      mimeType,
      parents: [targetFolderId]
    };

    const boundary = `kkn56_photo_upload_${Date.now()}`;
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
      console.error("Google Drive Upload API error:", errText);
      return `https://drive.google.com/open?id=fallback-${Date.now()}`;
    }

    const driveFile = await res.json();

    // Set permission to anyone with link viewable
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${driveFile.id}/permissions?supportsAllDrives=true&supportsTeamDrives=true`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `application/json`
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });

    } catch (permErr) {
      console.error("Failed to set permission on Drive file:", permErr);
    }

    return `https://docs.google.com/uc?export=download&id=${driveFile.id}`;
  } catch (err) {
    console.error("Failed to upload photo to Google Drive:", err);
    return `https://drive.google.com/open?id=fallback-error-${Date.now()}`;
  }
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Zod validation schema for coordinate boundaries
const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const surveys = body.surveys || body.drafts || (body.client_uuid ? [body] : null);

    if (!surveys || !Array.isArray(surveys)) {
      return NextResponse.json(
        { error: 'Format data antrean tidak valid' },
        { status: 400 }
      );
    }

    const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
    const results = [];
    const isUUID = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    for (const item of surveys) {
      const {
        client_uuid,
        rt_id,
        kk_name,
        kk_number,
        latitude,
        longitude,
        gps_accuracy,
        family_size,
        housing_status,
        housing_condition,
        main_job,
        monthly_income,
        problems,
        potentials,
        photo_url,
        surveyor_id
      } = item;

      // 1. Validate inputs via Zod
      const coordVal = coordinateSchema.safeParse({ latitude, longitude });
      if (!coordVal.success) {
        results.push({ client_uuid, status: 'error', error: 'Koordinat latitude/longitude di luar jangkauan' });
        continue;
      }

      // 2. Check sync idempotency
      try {
        const { data: existingSurvey } = await supabaseServer
          .from('survey')
          .select('id')
          .eq('client_uuid', client_uuid)
          .single();

        if (existingSurvey) {
          results.push({ client_uuid, status: 'synced', note: 'Data sudah tersinkronisasi sebelumnya' });
          continue;
        }

        // 3. Begin manual inserts
        // a. Insert Household with schema column fallback & valid RT UUID lookup
        let validRtId = isUUID(rt_id) ? rt_id : null;
        if (!validRtId) {
          try {
            const { data: rtList } = await supabaseServer.from('rt').select('id').limit(1);
            if (rtList && rtList.length > 0) {
              validRtId = rtList[0].id;
            }
          } catch (rtErr) {
            console.warn('RT UUID lookup warning:', rtErr);
          }
        }

        let householdData: any = null;

        const hhPayload: any = {
          kk_name: kk_name || 'Kepala Keluarga',
          kk_number: kk_number || null,
          latitude,
          longitude,
          gps_accuracy: gps_accuracy || 0,
          survey_status: 'completed',
          created_by: surveyor_id
        };
        if (validRtId) hhPayload.rt_id = validRtId;
        if (main_job) hhPayload.main_job = main_job;
        if (monthly_income) hhPayload.monthly_income = monthly_income;

        const resHh = await supabaseServer.from('household').insert([hhPayload]).select().single();
        if (resHh.error) {
          // Schema fallback: if columns don't exist yet in Supabase, retry without new optional columns
          delete hhPayload.main_job;
          delete hhPayload.monthly_income;
          const resHhRetry = await supabaseServer.from('household').insert([hhPayload]).select().single();
          if (resHhRetry.error) throw resHhRetry.error;
          householdData = resHhRetry.data;
        } else {
          householdData = resHh.data;
        }

        // b. Insert Survey with schema column fallback
        let surveyData: any = null;
        const svPayload: any = {
          household_id: householdData.id,
          surveyor_id,
          project_id: '56000000-0000-0000-0000-000000000056', // Static Project UUID Kelompok 56
          family_size,
          housing_status,
          housing_condition,
          client_uuid
        };
        if (main_job) svPayload.main_job = main_job;
        if (monthly_income) svPayload.monthly_income = monthly_income;

        const resSv = await supabaseServer.from('survey').insert([svPayload]).select().single();
        if (resSv.error) {
          delete svPayload.main_job;
          delete svPayload.monthly_income;
          const resSvRetry = await supabaseServer.from('survey').insert([svPayload]).select().single();
          if (resSvRetry.error) throw resSvRetry.error;
          surveyData = resSvRetry.data;
        } else {
          surveyData = resSv.data;
        }

        // c. Insert Problems
        if (problems && Array.isArray(problems) && problems.length > 0) {
          const problemInserts = problems.map(prob => ({
            survey_id: surveyData.id,
            category: prob.category,
            description: prob.description
          }));
          await supabaseServer.from('problem').insert(problemInserts);
        }

        // d. Insert Potentials
        if (potentials && Array.isArray(potentials) && potentials.length > 0) {
          const potentialInserts = potentials.map(pot => ({
            survey_id: surveyData.id,
            category: pot.category,
            description: pot.description
          }));
          await supabaseServer.from('potential').insert(potentialInserts);
        }

        // e. Auto-upload photo to Google Drive and save the drive reference url in Supabase
        if (photo_url) {
          try {
            const mimeType = photo_url.split(';')[0].split(':')[1] || 'image/jpeg';
            const extension = mimeType.split('/')[1] || 'jpg';
            const filename = `sensus_${rt_id}_${kk_name.replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
            const driveUrl = await uploadPhotoToGoogleDrive(photo_url, filename, surveyor_id);
            
            await supabaseServer.from('household_photo').insert([
              {
                household_id: householdData.id,
                storage_url: driveUrl,
                caption: `Fasad depan rumah ${kk_name} (Google Drive)`,
                uploaded_by: surveyor_id
              }
            ]);
          } catch (photoErr) {
            console.warn('Photo upload warning:', photoErr);
          }
        }

        results.push({ client_uuid, status: 'success' });
      } catch (err: any) {
        console.error('Error syncing survey item to Supabase:', err);
        results.push({ client_uuid, status: 'error', error: err.message || 'Supabase insert error' });
      }
    }

    const hasErrors = results.some(r => r.status === 'error');
    const allFailed = results.every(r => r.status === 'error');

    if (allFailed && results.length > 0) {
      return NextResponse.json({ success: false, error: results[0]?.error || 'Gagal sinkronisasi data', results }, { status: 500 });
    }

    return NextResponse.json({ success: !hasErrors, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memproses sinkronisasi data' },
      { status: 500 }
    );
  }
}
