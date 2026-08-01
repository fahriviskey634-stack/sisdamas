import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as docx from 'docx';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Shared members list — all 43 members across 3 groups
const KKN_MEMBERS: { nim: string; name: string; gender: string; prodi: string; fakultas: string; email: string; division: string; group: string; dusun: string; isKetua?: boolean }[] = [
  // --- KELOMPOK 55 (DUSUN 2 - RW 06) ---
  { nim: '1235030147', name: 'Muhammad Al Afgani', gender: 'L', prodi: 'S1 - Sastra Inggris', fakultas: 'Adab dan Humaniora', email: 'alafgani@sukahaji-official.id', division: 'Ketua (BPH)', group: '55', dusun: 'Dusun 2', isKetua: true },
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
  // --- KELOMPOK 56 (DUSUN 2 - RW 01, RW 05, RW 11) ---
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)', group: '56', dusun: 'Dusun 2', isKetua: true },
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
  // --- KELOMPOK 57 (DUSUN 1 - RW 03, RW 04) ---
  { nim: '1232050134', name: 'Hilman Farid', gender: 'L', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hilman@sukahaji-official.id', division: 'Ketua (BPH)', group: '57', dusun: 'Dusun 1', isKetua: true },
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

// Resolve ketua per group
function getKetuaForGroup(group: string) {
  const ketua = KKN_MEMBERS.find(m => m.group === group && m.isKetua);
  return ketua || { name: 'Arpan Maulana', nim: '1231030055' };
}

// Grey square fallback image (Base64)
const MOCK_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAS0lEQVR42u3PAQ0AAAgDoM+1sYYFHLg1kIS0qupRAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBgbswA52h+wJmFUkAAAAASUVORK5CYII=';

async function prepareForEmbed(photoUrl: string): Promise<Buffer> {
  try {
    let original: Buffer;
    if (!photoUrl || photoUrl.startsWith('📷') || photoUrl.includes('default_foto.jpg')) {
      original = Buffer.from(MOCK_IMAGE_BASE64, 'base64');
    } else if (photoUrl.startsWith('data:image')) {
      const parts = photoUrl.split(',');
      if (parts.length >= 2) {
        original = Buffer.from(parts[1], 'base64');
      } else {
        original = Buffer.from(MOCK_IMAGE_BASE64, 'base64');
      }
    } else {
      const res = await fetch(photoUrl);
      if (!res.ok) throw new Error('Fetch image failed');
      original = Buffer.from(await res.arrayBuffer());
    }
    
    return await sharp(original)
      .resize({ width: 200 })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (e) {
    console.error('Image embedding failed, falling back to mock icon:', e);
    return Buffer.from(MOCK_IMAGE_BASE64, 'base64');
  }
}

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

/**
 * Builds the DOCX buffer for a single member's logbook.
 * Shared by both format=docx and format=pdf (which now just serves the DOCX).
 */
async function buildLogbookDocx(member: typeof KKN_MEMBERS[0], entries: any[]): Promise<Buffer> {
  const docChildren: any[] = [];

  // Document Title
  docChildren.push(new docx.Paragraph({
    alignment: docx.AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new docx.TextRun({
        text: "LOGBOOK KKN SISDAMAS",
        bold: true,
        size: 28, // 14pt
      })
    ]
  }));

  docChildren.push(new docx.Paragraph({
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new docx.TextRun({
        text: "UIN SUNAN GUNUNG DJATI BANDUNG",
        bold: true,
        size: 24, // 12pt
      })
    ]
  }));

  docChildren.push(new docx.Paragraph({
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new docx.TextRun({
        text: "TAHUN AKADEMIK 2025/2026",
        bold: true,
        size: 22, // 11pt
      })
    ]
  }));

  // Identity list — dynamic per group
  const indentList = [
    `1. Nama : ${member.name}`,
    `2. NIM / Prodi : ${member.nim} / ${member.prodi}`,
    `3. Fakultas : ${member.fakultas}`,
    `4. Kelompok : Kelompok ${member.group || '56'}`,
    `5. Lokasi : ${member.dusun || 'Dusun 2'}, Desa Sukahaji, Kecamatan Cipeundeuy, Kabupaten Bandung Barat, Provinsi Jawa Barat`
  ];

  for (const item of indentList) {
    docChildren.push(new docx.Paragraph({
      spacing: { after: 80 },
      children: [
        new docx.TextRun({ text: item, size: 22 })
      ]
    }));
  }

  // Small spacing before table
  docChildren.push(new docx.Paragraph({ spacing: { before: 300 } }));

  // Prepare activities table rows
  const tableRows: docx.TableRow[] = [];

  // Header Row
  tableRows.push(new docx.TableRow({
    tableHeader: true,
    children: [
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 5, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "No", bold: true, size: 24 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 12, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Tanggal", bold: true, size: 24 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 35, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Kegiatan", bold: true, size: 24 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 38, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Output", bold: true, size: 24 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Bukti Foto", bold: true, size: 24 })] })] })
    ]
  }));

  let idx = 1;
  for (const entry of entries) {
    const d = new Date(entry.entry_date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    const acts = (entry.logbook_activity || []).filter(
      (a: any) => a.kegiatan !== 'PROGRAM_GALLERY_STORE' && !a.kegiatan?.startsWith('PROGRAM_') && a.id !== '56000000-0000-0000-0000-000000000099'
    );
    for (const act of acts) {
      const photos = parsePhotos(act.bukti_foto_url);
      const imgRuns: docx.ImageRun[] = [];

      for (const photoUrl of photos) {
        try {
          const imgBuffer = await prepareForEmbed(photoUrl);
          imgRuns.push(
            new docx.ImageRun({
              data: imgBuffer,
              transformation: { width: 100, height: 75 },
              type: "jpg"
            })
          );
        } catch (err) {
          console.error("Embed error for photo:", photoUrl, err);
        }
      }

      if (imgRuns.length === 0) {
        const fallbackBuffer = await prepareForEmbed('📷 default_foto.jpg');
        imgRuns.push(
          new docx.ImageRun({
            data: fallbackBuffer,
            transformation: { width: 100, height: 75 },
            type: "jpg"
          })
        );
      }

      tableRows.push(new docx.TableRow({
        children: [
          new docx.TableCell({ width: { size: 5, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: String(idx++), size: 24 })] })] }),
          new docx.TableCell({ width: { size: 12, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: dateFormatted, size: 24 })] })] }),
          new docx.TableCell({ width: { size: 35, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: act.kegiatan, size: 24 })] })] }),
          new docx.TableCell({ width: { size: 38, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: act.output, size: 24 })] })] }),
          new docx.TableCell({
            width: { size: 10, type: docx.WidthType.PERCENTAGE },
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: imgRuns
              })
            ]
          })
        ]
      }));
    }
  }

  if (idx === 1) {
    tableRows.push(new docx.TableRow({
      children: [
        new docx.TableCell({ columnSpan: 5, children: [new docx.Paragraph({ text: "Tidak ada kegiatan pada periode ini.", alignment: docx.AlignmentType.CENTER })] })
      ]
    }));
  }

  docChildren.push(new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: tableRows
  }));

  // Signatures — dynamic per group
  const ketua = getKetuaForGroup(member.group || '56');

  docChildren.push(new docx.Paragraph({ spacing: { before: 600 } }));

  docChildren.push(new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    borders: docx.TableBorders.NONE,
    rows: [
      new docx.TableRow({
        children: [
          new docx.TableCell({
            children: [
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Bandung Barat, ........................ 2026", size: 24 })] }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Peserta,", bold: true, size: 24 })] }),
              new docx.Paragraph({ spacing: { before: 1000 } }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: member.name, bold: true, size: 24 })] }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: `NIM. ${member.nim}`, size: 24 })] })
            ]
          }),
          new docx.TableCell({
            children: [
              new docx.Paragraph({ children: [new docx.TextRun({ text: "", size: 24 })] }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Ketua Kelompok,", bold: true, size: 24 })] }),
              new docx.Paragraph({ spacing: { before: 1000 } }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: ketua.name, bold: true, size: 24 })] }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: `NIM. ${ketua.nim}`, size: 24 })] })
            ]
          })
        ]
      }),
      new docx.TableRow({
        children: [
          new docx.TableCell({
            columnSpan: 2,
            children: [
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 500 }, children: [new docx.TextRun({ text: "Mengetahui,", size: 24 })] }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dosen Pembimbing Lapangan (DPL)", bold: true, size: 24 })] }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 1000 } }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dr. Hj. Yani Heryani, M.Ag.", bold: true, size: 24 })] }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "NIP. 197207101998021001", size: 24 })] })
            ]
          })
        ]
      })
    ]
  }));

  const doc = new docx.Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24, color: "000000" } // 12pt
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } // 2cm
        }
      },
      children: docChildren
    }]
  });

  const buffer = await docx.Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generateDocxResponse(member: typeof KKN_MEMBERS[0], entries: any[]) {
  const buffer = await buildLogbookDocx(member, entries);
  const fileBasename = `logbook_${member.name.toLowerCase().replace(/\s+/g, '_')}`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${fileBasename}.docx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, logbookData } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id (NIM) wajib diisi' }, { status: 400 });
    }

    const member = KKN_MEMBERS.find(m => m.nim === user_id);
    if (!member) {
      return NextResponse.json({ error: 'NIM tidak terdaftar dalam daftar anggota KKN' }, { status: 404 });
    }

    const mergedMap = new Map<string, any[]>();

    // 1. Fetch all cloud entries for this user from Supabase
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
        const { data: dbEntries } = await supabaseServer
          .from('logbook_entry')
          .select('id, entry_date')
          .eq('nim', user_id)
          .order('entry_date', { ascending: true });

        if (dbEntries && dbEntries.length > 0) {
          const entryIds = dbEntries.map(e => e.id);
          const { data: dbActs } = await supabaseServer
            .from('logbook_activity')
            .select('*')
            .in('entry_id', entryIds)
            .order('created_at', { ascending: true });

          dbEntries.forEach(entry => {
            const acts = (dbActs || []).filter(a => a.entry_id === entry.id && a.kegiatan !== 'PROGRAM_GALLERY_STORE' && !a.kegiatan?.startsWith('PROGRAM_') && a.id !== '56000000-0000-0000-0000-000000000099');
            if (acts.length > 0) {
              mergedMap.set(entry.entry_date, acts);
            }
          });
        }
      } catch (dbErr) {
        console.warn('[Export Logbook POST] DB fetch warning:', dbErr);
      }
    }

    // 2. Merge incoming logbookData on top
    if (logbookData && typeof logbookData === 'object') {
      Object.keys(logbookData).forEach(d => {
        if (logbookData[d] && Array.isArray(logbookData[d]) && logbookData[d].length > 0) {
          const cleanActs = logbookData[d].filter((a: any) => a.kegiatan !== 'PROGRAM_GALLERY_STORE' && !a.kegiatan?.startsWith('PROGRAM_') && a.id !== '56000000-0000-0000-0000-000000000099');
          if (cleanActs.length > 0) {
            mergedMap.set(d, cleanActs);
          }
        }
      });
    }

    const sortedDates = Array.from(mergedMap.keys()).sort();
    const entries = sortedDates.map(d => ({
      entry_date: d,
      logbook_activity: mergedMap.get(d) || []
    }));

    return await generateDocxResponse(member, entries);
  } catch (err: any) {
    console.error('Export Logbook POST Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengekspor logbook' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!userId) {
      return NextResponse.json({ error: 'user_id (NIM) wajib diisi' }, { status: 400 });
    }

    const member = KKN_MEMBERS.find(m => m.nim === userId);
    if (!member) {
      return NextResponse.json({ error: 'NIM tidak terdaftar dalam daftar anggota KKN (Kelompok 55/56/57)' }, { status: 404 });
    }

    // Fetch entries from Supabase
    let entries: any[] = [];

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        
        let entryQuery = supabaseServer
          .from('logbook_entry')
          .select('id, entry_date')
          .eq('nim', userId);

        if (startDate) entryQuery = entryQuery.gte('entry_date', startDate);
        if (endDate) entryQuery = endDate ? entryQuery.lte('entry_date', endDate) : entryQuery;

        const { data: entryData, error: entryError } = await entryQuery.order('entry_date', { ascending: true });

        if (entryError) {
          console.error('[Export Logbook] Entry query error:', entryError);
        } else if (entryData && entryData.length > 0) {
          const entryIds = entryData.map((e: any) => e.id);
          const { data: activityData, error: activityError } = await supabaseServer
            .from('logbook_activity')
            .select('id, entry_id, kegiatan, output, volume, satuan, bukti_foto_url')
            .in('entry_id', entryIds)
            .order('created_at', { ascending: true });

          if (activityError) {
            console.error('[Export Logbook] Activity query error:', activityError);
          }

          entries = entryData.map((entry: any) => ({
            ...entry,
            logbook_activity: (activityData || []).filter((act: any) => act.entry_id === entry.id && act.kegiatan !== 'PROGRAM_GALLERY_STORE' && !act.kegiatan?.startsWith('PROGRAM_') && act.id !== '56000000-0000-0000-0000-000000000099')
          }));
        }
      } catch (dbErr) {
        console.warn('[Export Logbook] Supabase query failed:', dbErr);
      }
    }

    return await generateDocxResponse(member, entries);

  } catch (err: any) {
    console.error('Export Logbook GET Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengekspor logbook' }, { status: 500 });
  }
}
