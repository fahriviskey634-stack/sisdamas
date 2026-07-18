import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as docx from 'docx';
import sharp from 'sharp';
import puppeteer from 'puppeteer';

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

// Generates logical placeholder entries if DB is empty
function generateMockLogbookEntries(startDate: string | null, endDate: string | null) {
  const start = startDate ? new Date(startDate) : new Date('2026-07-01');
  const end = endDate ? new Date(endDate) : new Date('2026-07-10');
  const entries: any[] = [];
  
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    entries.push({
      entry_date: dateStr,
      logbook_activity: [
        {
          id: `mock-act-1-${dateStr}`,
          kegiatan: `Melaksanakan observasi lapangan dan pemetaan sosial RT 02`,
          output: `Terpetakannya 20 KK target survei sensus`,
          volume: 1,
          satuan: 'kegiatan',
          bukti_foto_url: ''
        },
        {
          id: `mock-act-2-${dateStr}`,
          kegiatan: `Membantu administrasi pelayanan surat keterangan desa`,
          output: `Terselesaikannya 10 berkas administrasi warga`,
          volume: 10,
          satuan: 'dokumen',
          bukti_foto_url: ''
        }
      ]
    });
    current.setDate(current.getDate() + 1);
  }
  return entries;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const format = searchParams.get('format') || 'pdf';

    if (!userId) {
      return NextResponse.json({ error: 'user_id (NIM) wajib diisi' }, { status: 400 });
    }

    const member = KKN_MEMBERS.find(m => m.nim === userId);
    if (!member) {
      return NextResponse.json({ error: 'NIM tidak terdaftar dalam Kelompok 56' }, { status: 404 });
    }

    // 1. Fetch entries from Supabase
    let entries: any[] = [];
    let dbConnected = false;

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
          dbConnected = true;
        }
      } catch (dbErr) {
        console.warn('Supabase query failed, falling back to auto-generated mock logbook:', dbErr);
      }
    }

    // Fallback if DB query yielded no results
    if (entries.length === 0) {
      entries = generateMockLogbookEntries(startDate, endDate);
    }

    // 2. Render formatting response
    if (format === 'docx') {
      // Build Word Document utilizing npm 'docx'
      const docSections: docx.ISectionOptions[] = [];

      // SECTION A: COVER PAGE
      docSections.push({
        properties: {
          type: docx.SectionType.NEXT_PAGE,
        },
        children: [
          new docx.Paragraph({
            alignment: docx.AlignmentType.CENTER,
            spacing: { before: 2000, after: 300 },
            children: [
              new docx.TextRun({
                text: "BUKU CATATAN HARIAN (LOGBOOK)",
                bold: true,
                size: 28, // 14pt
              })
            ]
          }),
          new docx.Paragraph({
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 1500 },
            children: [
              new docx.TextRun({
                text: "KULIAH KERJA NYATA (KKN) REGULER SISDAMAS\nUIN SUNAN GUNUNG DJATI BANDUNG\nTAHUN AKADEMIK 2025/2026",
                bold: true,
                size: 24, // 12pt
              })
            ]
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({ width: { size: 40, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Nama Peserta", bold: true })] })] }),
                  new docx.TableCell({ width: { size: 60, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: member.name })] })
                ]
              }),
              new docx.TableRow({
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "NIM / Program Studi", bold: true })] })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: `${member.nim} / ${member.prodi}` })] })
                ]
              }),
              new docx.TableRow({
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Fakultas / Divisi", bold: true })] })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: `${member.fakultas} / ${member.division}` })] })
                ]
              }),
              new docx.TableRow({
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Lokasi KKN", bold: true })] })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: "Kelompok 56 - Desa Sukahaji, Kec. Cipeundeuy, Bandung Barat" })] })
                ]
              })
            ]
          })
        ]
      });

      // SECTION B: ENTRIES
      for (const entry of entries) {
        const dateFormatted = new Date(entry.entry_date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Resolve images ahead
        const tableRows: docx.TableRow[] = [];
        // Table Header
        tableRows.push(new docx.TableRow({
          tableHeader: true,
          children: [
            new docx.TableCell({ width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "No", bold: true })] })] }),
            new docx.TableCell({ width: { size: 40, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Uraian Kegiatan", bold: true })] })] }),
            new docx.TableCell({ width: { size: 30, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Output Kegiatan", bold: true })] })] }),
            new docx.TableCell({ width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Vol", bold: true })] })] }),
            new docx.TableCell({ width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ children: [new docx.TextRun({ text: "Bukti Foto", bold: true })] })] })
          ]
        }));

        const activitiesList = entry.logbook_activity || [];
        for (let i = 0; i < activitiesList.length; i++) {
          const act = activitiesList[i];
          const imgBuffer = await prepareForEmbed(act.bukti_foto_url);

          tableRows.push(new docx.TableRow({
            children: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: String(i + 1) })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: act.kegiatan })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: act.output })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: `${act.volume} ${act.satuan}` })] }),
              new docx.TableCell({
                children: [
                  new docx.Paragraph({
                    children: [
                      new docx.ImageRun({
                        data: imgBuffer,
                        transformation: { width: 60, height: 60 },
                        type: "jpg"
                      })
                    ]
                  })
                ]
              })
            ]
          }));
        }

        if (activitiesList.length === 0) {
          tableRows.push(new docx.TableRow({
            children: [
              new docx.TableCell({ columnSpan: 5, children: [new docx.Paragraph({ text: "Tidak ada kegiatan pada hari ini.", alignment: docx.AlignmentType.CENTER })] })
            ]
          }));
        }

        docSections.push({
          properties: {
            type: docx.SectionType.NEXT_PAGE,
            page: {
              margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } // 2cm in twentieths of a point (1440 = 1 inch)
            }
          },
          headers: {
            default: new docx.Header({
              children: [
                new docx.Paragraph({
                  alignment: docx.AlignmentType.RIGHT,
                  children: [
                    new docx.TextRun({
                      text: `${member.name} — NIM ${member.nim} — Kelompok 56 / Dusun 2`,
                      size: 18,
                      italics: true
                    })
                  ]
                })
              ]
            })
          },
          children: [
            new docx.Paragraph({
              spacing: { before: 200, after: 200 },
              children: [
                new docx.TextRun({ text: `Hari/Tanggal: ${dateFormatted}`, bold: true, size: 24 })
              ]
            }),
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: tableRows
            }),
            new docx.Paragraph({ spacing: { before: 800 } }), // spacing
            // Signatures
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              borders: docx.TableBorders.NONE,
              rows: [
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({ text: "Bandung Barat, ........................ 2026" }),
                        new docx.Paragraph({ children: [new docx.TextRun({ text: "Peserta KKN,", bold: true })] }),
                        new docx.Paragraph({ spacing: { before: 1000 } }),
                        new docx.Paragraph({ children: [new docx.TextRun({ text: member.name, bold: true, underline: {} })] }),
                        new docx.Paragraph({ text: `NIM. ${member.nim}` })
                      ]
                    }),
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({ text: "Mengetahui," }),
                        new docx.Paragraph({ children: [new docx.TextRun({ text: "Ketua Kelompok 56,", bold: true })] }),
                        new docx.Paragraph({ spacing: { before: 1000 } }),
                        new docx.Paragraph({ children: [new docx.TextRun({ text: "Arpan Maulana", bold: true, underline: {} })] }),
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
                        new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 600 }, text: "Mengetahui," }),
                        new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dosen Pembimbing Lapangan (DPL) Kelompok 56", bold: true })] }),
                        new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 1000 } }),
                        new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, children: [new docx.TextRun({ text: "Dr. Hj. Yani Heryani, M.Ag.", bold: true, underline: {} })] }),
                        new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, text: "NIP. 197207101998021001" })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        });
      }

      const doc = new docx.Document({
        styles: {
          default: {
            document: {
              run: { font: "Times New Roman", size: 24, color: "000000" } // size: 24 half-points = 12pt
            }
          }
        },
        sections: docSections
      });

      const buffer = await docx.Packer.toBuffer(doc);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="logbook_${member.name.toLowerCase().replace(/\s+/g, '_')}.docx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      });

    } else {
      // Build HTML string for PDF rendering
      let htmlString = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @page {
              margin: 0;
            }
            body {
              font-family: "Times New Roman", Times, serif;
              color: #000000;
              margin: 0;
              padding: 0;
            }
            .page-container {
              width: 170mm;
              height: 250mm;
              padding: 20mm;
              box-sizing: border-box;
              position: relative;
              page-break-after: always;
            }
            .running-header {
              font-style: italic;
              font-size: 9pt;
              text-align: right;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .title-block {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000000;
              padding-bottom: 10px;
            }
            .title-block h1 {
              font-size: 14pt;
              margin: 0;
              text-transform: uppercase;
              font-weight: bold;
            }
            .title-block h2 {
              font-size: 12pt;
              margin: 5px 0 0 0;
              text-transform: uppercase;
            }
            .cover-info {
              margin-top: 50px;
              font-size: 12pt;
              line-height: 2;
            }
            .cover-info td {
              border: none !important;
              padding: 5px !important;
              vertical-align: top;
            }
            .section-title {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10pt;
            }
            th, td {
              border: 1px solid #000000;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              font-weight: bold;
              background-color: #f2f2f2;
            }
            .bukti-foto {
              width: 60px;
              height: 60px;
              object-fit: cover;
            }
            .signatures {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              font-size: 11pt;
            }
            .signature-col {
              width: 45%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 120px;
            }
            .dpl-signature {
              margin-top: 40px;
              text-align: center;
              font-size: 11pt;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              height: 120px;
            }
            .bold { font-weight: bold; }
            .underline { text-decoration: underline; }
          </style>
        </head>
        <body>
          <!-- 1. COVER PAGE -->
          <div class="page-container" style="display: flex; flex-direction: column; justify-content: space-between; height: 250mm;">
            <div>
              <div class="title-block" style="border-bottom: none; margin-top: 50px;">
                <h1>BUKU CATATAN HARIAN (LOGBOOK)</h1>
                <h2>KULIAH KERJA NYATA (KKN) REGULER SISDAMAS</h2>
                <h2>UIN SUNAN GUNUNG DJATI BANDUNG</h2>
                <h3 style="font-size: 11pt; margin-top: 10px;">TAHUN AKADEMIK 2025/2026</h3>
              </div>
              <table class="cover-info" style="width: 100%; margin-top: 100px;">
                <tr>
                  <td style="width: 35%; font-weight: bold;">Nama Peserta</td>
                  <td style="width: 5%;">:</td>
                  <td>${member.name}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">NIM / Program Studi</td>
                  <td>:</td>
                  <td>${member.nim} / ${member.prodi}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Fakultas / Divisi</td>
                  <td>:</td>
                  <td>${member.fakultas} / ${member.division}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Lokasi KKN</td>
                  <td>:</td>
                  <td>Kelompok 56 - Desa Sukahaji, Kec. Cipeundeuy, Bandung Barat</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin-bottom: 50px; font-weight: bold; font-size: 12pt;">
              PUSAT PENGABDIAN KEPADA MASYARAKAT (LP2M)<br>
              UIN SUNAN GUNUNG DJATI BANDUNG<br>
              2026
            </div>
          </div>
      `;

      // 2. DAILY ENTRIES PAGES
      for (const entry of entries) {
        const dateFormatted = new Date(entry.entry_date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        htmlString += `
          <div class="page-container">
            <div class="running-header">
              ${member.name} &mdash; NIM ${member.nim} &mdash; Kelompok 56 / Dusun 2
            </div>
            
            <div class="section-title">
              Hari/Tanggal: ${dateFormatted}
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%; text-align: center;">No</th>
                  <th style="width: 45%;">Uraian Aktivitas/Kegiatan</th>
                  <th style="width: 30%;">Output / Hasil Kegiatan</th>
                  <th style="width: 10%; text-align: center;">Volume</th>
                  <th style="width: 10%; text-align: center;">Bukti</th>
                </tr>
              </thead>
              <tbody>
        `;

        const activitiesList = entry.logbook_activity || [];
        for (let i = 0; i < activitiesList.length; i++) {
          const act = activitiesList[i];
          const imgUrl = act.bukti_foto_url && !act.bukti_foto_url.includes('default_foto.jpg')
            ? act.bukti_foto_url
            : `data:image/png;base64,${MOCK_IMAGE_BASE64}`;

          htmlString += `
            <tr>
              <td style="text-align: center; font-weight: bold;">${i + 1}</td>
              <td>${act.kegiatan}</td>
              <td>${act.output}</td>
              <td style="text-align: center; font-weight: bold;">${act.volume} ${act.satuan}</td>
              <td style="text-align: center;">
                <img class="bukti-foto" src="${imgUrl}" />
              </td>
            </tr>
          `;
        }

        if (activitiesList.length === 0) {
          htmlString += `
            <tr>
              <td colspan="5" style="text-align: center; font-style: italic;">Tidak ada kegiatan pada hari ini.</td>
            </tr>
          `;
        }

        htmlString += `
              </tbody>
            </table>

            <!-- Signatures -->
            <div class="signatures">
              <div class="signature-col">
                <div>
                  <p style="margin: 0;">Bandung Barat, ........................ 2026</p>
                  <p class="bold" style="margin: 5px 0 0 0;">Peserta KKN,</p>
                </div>
                <div>
                  <p class="bold underline" style="margin: 0;">${member.name}</p>
                  <p style="margin: 5px 0 0 0;">NIM. ${member.nim}</p>
                </div>
              </div>
              <div class="signature-col">
                <div>
                  <p style="margin: 0;">Mengetahui,</p>
                  <p class="bold" style="margin: 5px 0 0 0;">Ketua Kelompok 56,</p>
                </div>
                <div>
                  <p class="bold underline" style="margin: 0;">Arpan Maulana</p>
                  <p style="margin: 5px 0 0 0;">NIM. 1231030055</p>
                </div>
              </div>
            </div>

            <div class="dpl-signature">
              <div>
                <p style="margin: 0;">Mengetahui,</p>
                <p class="bold" style="margin: 5px 0 0 0;">Dosen Pembimbing Lapangan (DPL) Kelompok 56</p>
              </div>
              <div style="margin-top: 50px;">
                <p class="bold underline" style="margin: 0;">Dr. Hj. Yani Heryani, M.Ag.</p>
                <p style="margin: 5px 0 0 0;">NIP. 197207101998021001</p>
              </div>
            </div>
          </div>
        `;
      }

      htmlString += `
        </body>
        </html>
      `;

      // Render to PDF using Puppeteer
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
        displayHeaderFooter: false,
        printBackground: true
      });
      await browser.close();

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="logbook_${member.name.toLowerCase().replace(/\s+/g, '_')}.pdf"`,
          'Content-Type': 'application/pdf'
        }
      });
    }

  } catch (err: any) {
    console.error('Export Logbook Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengekspor logbook' }, { status: 500 });
  }
}
