import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as docx from 'docx';
import sharp from 'sharp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Shared members list matching configuration
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

  // Identity list (no section label)
  const indentList = [
    `1. Nama : ${member.name}`,
    `2. NIM / Prodi : ${member.nim} / ${member.prodi}`,
    `3. Fakultas : ${member.fakultas}`,
    `4. Kelompok : Kelompok 56`,
    `5. Lokasi : Dusun 2, Desa Sukahaji, Kecamatan Cipeundeuy, Kabupaten Bandung Barat, Provinsi Jawa Barat`
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
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 8, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "No", bold: true, size: 22 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 17, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Tanggal", bold: true, size: 22 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 40, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Kegiatan", bold: true, size: 22 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 25, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Output", bold: true, size: 22 })] })] }),
      new docx.TableCell({ shading: { fill: "FFF2CC" }, width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Bukti Foto", bold: true, size: 22 })] })] })
    ]
  }));

  let idx = 1;
  for (const entry of entries) {
    const d = new Date(entry.entry_date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    const acts = entry.logbook_activity || [];
    for (const act of acts) {
      const imgBuffer = await prepareForEmbed(act.bukti_foto_url);

      tableRows.push(new docx.TableRow({
        children: [
          new docx.TableCell({ width: { size: 8, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, text: String(idx++) })] }),
          new docx.TableCell({ width: { size: 17, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, text: dateFormatted })] }),
          new docx.TableCell({ width: { size: 40, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: act.kegiatan })] }),
          new docx.TableCell({ width: { size: 25, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: act.output })] }),
          new docx.TableCell({
            width: { size: 10, type: docx.WidthType.PERCENTAGE },
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: [
                  new docx.ImageRun({
                    data: imgBuffer,
                    transformation: { width: 50, height: 50 },
                    type: "jpg"
                  })
                ]
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

  // Signatures
  docChildren.push(new docx.Paragraph({ spacing: { before: 600 } }));

  docChildren.push(new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    borders: docx.TableBorders.NONE,
    rows: [
      new docx.TableRow({
        children: [
          new docx.TableCell({
            children: [
              new docx.Paragraph({ text: "Bandung Barat, ........................ 2026" }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Peserta,", bold: true })] }),
              new docx.Paragraph({ spacing: { before: 1000 } }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: member.name, bold: true })] }),
              new docx.Paragraph({ text: `NIM. ${member.nim}` })
            ]
          }),
          new docx.TableCell({
            children: [
              new docx.Paragraph({ text: "" }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Ketua Kelompok,", bold: true })] }),
              new docx.Paragraph({ spacing: { before: 1000 } }),
              new docx.Paragraph({ children: [new docx.TextRun({ text: "Arpan Maulana", bold: true })] }),
              new docx.Paragraph({ text: "NIM. 1231030055" })
            ]
          })
        ]
      }),
      new docx.TableRow({
        children: [
          new docx.TableCell({
            columnSpan: 2,
            children: [
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 500 }, text: "Mengetahui," }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dosen Pembimbing Lapangan (DPL)", bold: true })] }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 1000 } }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dr. Hj. Yani Heryani, M.Ag.", bold: true })] }),
              new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, text: "NIP. 197207101998021001" })
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const format = searchParams.get('format') || 'docx';

    if (!userId) {
      return NextResponse.json({ error: 'user_id (NIM) wajib diisi' }, { status: 400 });
    }

    const member = KKN_MEMBERS.find(m => m.nim === userId);
    if (!member) {
      return NextResponse.json({ error: 'NIM tidak terdaftar dalam Kelompok 56' }, { status: 404 });
    }

    // Fetch entries from Supabase
    let entries: any[] = [];

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        
        let query = supabaseServer
          .from('logbook_entry')
          .select('id, entry_date, logbook_activity(*)')
          .eq('nim', userId);

        if (startDate) query = query.gte('entry_date', startDate);
        if (endDate) query = query.lte('entry_date', endDate);

        const { data, error } = await query.order('entry_date', { ascending: true });

        if (!error && data && data.length > 0) {
          entries = data;
        }
      } catch (dbErr) {
        console.warn('Supabase query failed:', dbErr);
      }
    }

    // No fallback to mock data — if empty, the table just shows empty message

    // Build DOCX for all formats (PDF just serves the same DOCX file)
    const buffer = await buildLogbookDocx(member, entries);
    const fileBasename = `logbook_${member.name.toLowerCase().replace(/\s+/g, '_')}`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileBasename}.docx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    });

  } catch (err: any) {
    console.error('Export Logbook Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengekspor logbook' }, { status: 500 });
  }
}
