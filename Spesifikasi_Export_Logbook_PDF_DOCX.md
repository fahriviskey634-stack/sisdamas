# Spesifikasi: Export Logbook ke PDF & DOCX (Server-Side, dengan Foto)

Konteks: saat ini export logbook masih pakai `window.print()` dari tampilan dashboard,
sehingga hasilnya kena header/footer bawaan browser, font tidak konsisten (bukan Times
New Roman), warna teks berubah biru pada nama yang di-render sebagai link, dan foto
bukti kegiatan tidak ikut tercetak. Spesifikasi ini mengganti pendekatan itu dengan
generate file dari data asli (Supabase), bukan dari screenshot halaman.

## 1. Prinsip Arsitektur

Satu sumber data → dua renderer keluaran (PDF & DOCX). Jangan generate dari HTML
tampilan dashboard; ambil langsung dari tabel `logbook_entries` + `logbook_activities`
+ storage foto.

```
GET /api/export/logbook
  ?user_id=...          (wajib)
  &start_date=...        (opsional, default: seluruh periode KKN)
  &end_date=...
  &format=pdf|docx        (wajib)
```

Alur di dalam endpoint:
1. Fetch profil peserta (nama, NIM, prodi, fakultas, divisi, kelompok, dusun, lokasi)
2. Fetch `logbook_entries` dalam rentang tanggal, join `logbook_activities`
3. Untuk tiap `bukti_foto_url`, download & resize foto (lihat bagian 5)
4. Render halaman cover (sekali) + halaman entri (per tanggal, dengan running header
   — lihat bagian 2)
5. Return file sebagai stream/buffer dengan `Content-Disposition: attachment`

## 2. Cover Page vs Running Header — Jangan Ulang Semua Info di Tiap Halaman

Data profil peserta terbagi dua sifat, dan render-nya harus mengikuti itu:

**Statis, cukup sekali di halaman sampul (cover):**
- Prodi, Fakultas — data akademik, tidak berubah selama KKN
- Divisi — tetap sama dari awal sampai akhir
- Desa, Kecamatan, Kabupaten, Provinsi — ini malah sama untuk **satu kelompok**, bukan
  spesifik per-peserta, jadi janggal kalau diulang di tiap entri harian

**Running header, tetap muncul di tiap halaman entri (untuk identifikasi cepat kalau
halaman/PDF terpisah):**
- Nama Peserta + NIM
- Kelompok / Dusun

Struktur dokumen jadi:

```
[Halaman 1 — Cover]
  Judul dokumen
  Semua field lengkap (nama, NIM, prodi, fakultas, divisi, kelompok,
  dusun, desa, kecamatan, kabupaten, provinsi)

[Halaman 2..n — per entri tanggal]
  Running header pendek: "Fahry Rizky Samsudin — NIM 1237030018 — Kelompok 56 / Dusun 2"
  Tabel kegiatan tanggal tsb
```

Ini tidak mengubah struktur data — field statis itu memang sudah diambil dari `users` &
`project_settings` (lihat tabel pemetaan field), jadi ini murni soal bagaimana
komponen render-nya disusun, bukan perubahan skema database.

## 3. Render PDF

Gunakan **Puppeteer** (bukan `window.print()` browser klien) atau `@react-pdf/renderer`.
Puppeteer lebih gampang kalau kamu sudah punya komponen HTML/CSS untuk cetak — cukup
render komponen itu di server lalu screenshot-to-PDF, tapi dengan CSS yang benar dan
tanpa header/footer browser:

```js
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(htmlString, { waitUntil: 'networkidle0' });
const pdfBuffer = await page.pdf({
  format: 'A4',
  margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
  displayHeaderFooter: false, // ini kunci hilangkan "7/18/26, 1:02 PM ..." dan URL
  printBackground: true,
});
```

CSS wajib disematkan di `htmlString` tersebut:

```css
@page { margin: 0; }
body { font-family: "Times New Roman", Times, serif; color: #000; font-size: 12pt; }
a { color: #000 !important; text-decoration: none !important; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid #000; padding: 8px 10px; }
img.bukti-foto { width: 60px; height: 60px; object-fit: cover; }
```

## 4. Render DOCX

Pakai package `docx` (npm), sama seperti yang dipakai untuk bikin mock-up format
sebelumnya. Tabel kegiatan pakai struktur yang sama, kolom Bukti/Foto diisi `ImageRun`,
bukan teks nama file:

```js
const { ImageRun, Table, TableRow, TableCell } = require("docx");

// resizedBuffer didapat dari langkah resize di bagian 5
new TableCell({
  children: [
    new Paragraph({
      children: [
        new ImageRun({
          data: resizedBuffer,
          transformation: { width: 60, height: 60 }, // px, wajib di-set manual
          type: "jpg",
        }),
      ],
    }),
  ],
});
```

Font default dokumen di-set lewat `styles` pada `Document`:

```js
new Document({
  styles: {
    default: {
      document: {
        run: { font: "Times New Roman", size: 24, color: "000000" }, // size dalam half-points, 24 = 12pt
      },
    },
  },
  sections: [...],
});
```

## 5. Wajib: Resize Foto Sebelum Di-embed

Foto dari kamera HP biasanya 2-5 MB per file. Kalau 1 hari ada 3-4 foto kegiatan × 40
hari × 15 anggota tim, embed foto asli bikin file DOCX/PDF membengkak sampai puluhan
MB dan lambat dibuka. Resize dulu pakai `sharp` sebelum di-embed:

```js
const sharp = require("sharp");

async function prepareForEmbed(photoUrl) {
  const res = await fetch(photoUrl);
  const original = Buffer.from(await res.arrayBuffer());
  return sharp(original)
    .resize({ width: 200 })   // lebar cukup untuk thumbnail di tabel
    .jpeg({ quality: 70 })
    .toBuffer();
}
```

Lakukan ini paralel untuk semua foto dalam satu entri sebelum mulai render dokumen,
supaya endpoint tidak nunggu satu-satu.

## 6. Gabung 15 Logbook Jadi Satu Dokumen LPJ Kelompok (opsional, untuk Ketua Kelompok)

Tambahkan mode export kedua:

```
GET /api/export/logbook-kelompok?kelompok_id=...&format=pdf|docx
```

Loop tiap anggota → render cover page-nya + blok entri per tanggal (running header +
tabel + tanda tangan) → sisipkan `PageBreak` antar anggota (DOCX) atau `page-break-after:
always` (CSS untuk PDF). Ini yang paling menghemat waktu Ketua Kelompok saat menyusun
LPJ akhir, karena tidak perlu compile manual dari 15 file terpisah.

## 7. Checklist Sebelum Dianggap Selesai

- [ ] Font di kedua format konsisten Times New Roman, teks hitam (termasuk nama yang
      sebelumnya jadi link biru)
- [ ] Tidak ada lagi header/footer bawaan browser (jam, judul tab, URL)
- [ ] Foto bukti kegiatan benar-benar tampil sebagai gambar kecil di tabel, bukan nama
      file
- [ ] Data statis (prodi, fakultas, divisi, desa, kecamatan, kabupaten, provinsi) hanya
      muncul sekali di cover, tidak diulang di tiap halaman entri
- [ ] Running header tiap halaman entri cukup: nama, NIM, kelompok/dusun
- [ ] Ukuran file DOCX untuk 1 bulan logbook (± 40 entri × rata-rata 2 foto) tetap di
      bawah ~5 MB setelah resize
- [ ] Endpoint export kelompok (gabungan 15 orang) menghasilkan satu file dengan page
      break rapi antar anggota
- [ ] Tabel border solid 1px, padding sel konsisten, sesuai format resmi BAB VII

## 8. Package yang Dibutuhkan

```bash
npm install docx sharp puppeteer
# jika pakai @react-pdf/renderer sebagai alternatif Puppeteer:
npm install @react-pdf/renderer
```

Catatan: Puppeteer butuh Chromium headless — kalau deploy di Vercel, pertimbangkan
`@sparticuz/chromium` + `puppeteer-core` karena ukuran binary default Puppeteer sering
kena limit function size di Vercel serverless.
