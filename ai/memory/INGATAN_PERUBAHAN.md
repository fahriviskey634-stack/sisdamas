# Dokumentasi Ingatan Permanen Perubahan Platform Digital KKN Sisdamas Kelompok 56

## 📌 Ringkasan Seluruh Perubahan Sistem

### 1. Refaktorisasi Modular Dashboard (13 File Independen)
- Monolitik `page.tsx` (4.243 baris) dipecah menjadi 13 komponen independen di `src/app/app/dashboard/components/`:
  - `types.ts`, `constants.ts`, `utils.ts`
  - `DashboardView.tsx`, `Siklus2View.tsx`, `SurveyWizardView.tsx`, `MapView.tsx`, `PriorityView.tsx`, `LogbookView.tsx`, `Siklus4View.tsx`, `StickyNotesView.tsx`, `DokumentasiGalleryView.tsx`, `ProfileView.tsx`.
- `page.tsx` diperkecil menjadi **~280 baris** sebagai Layout Shell & Router.

### 2. Peta GIS & Batas Wilayah Sukahaji
- Menggunakan Google Satellite Hybrid tiles di Leaflet GIS.
- Menampilkan polygon merah putus-putus batas fisik resmi Desa Sukahaji, Cipeundeuy.
- Integrasi Google Maps Embed CID `2054103360592180660` + Kartu Legenda Peta Tematik.

### 3. Penyelarasan Data RT/RW Dusun 2 (15 RT Resmi)
- **RW 01**: RT 01, RT 02, RT 03, RT 04
- **RW 05**: RT 01, RT 02, RT 03, RT 04
- **RW 06**: RT 01, RT 02, RT 03, RT 04
- **RW 11**: RT 01, RT 02, RT 03

### 4. Galeri Foto & Pembuatan Folder Google Drive
- Opsi `➕ Buat Folder Baru Drive` dengan nama folder khusus.
- Folder dibuat otomatis di Drive: `[Tanggal] - [Nama Folder Anda]`.
- Dukungan foto & video.

### 5. Fix Google Drive OAuth2 Refresh Token Auth
- Otentikasi dialihkan ke Google OAuth2 Refresh Token (`GOOGLE_CLIENT_ID` & `GOOGLE_REFRESH_TOKEN`).
- Menghasilkan URL gambar langsung: `https://lh3.googleusercontent.com/d/[ID]=s1600`.
- Safe DataURI fallback jika Drive offline/lambat.

### 6. Fix Sinkronisasi Database Supabase / SQL
- Mengonversi ID ke format RFC-4122 UUID via MD5 Hashing.
- Mengatasi constraint `priority_item_id` dan `program_status_check`.
- Data tersimpan permanen di cloud tanpa hilang saat di-refresh pada HP & Laptop.

### 7. Navigasi Navbar & Sub-Menu Terintegrasi
- Merapikan navbar dari 9 tombol menjadi 7 menu utama yang bersih:
  - **Siklus 2**: Form Sensus + Peta GIS.
  - **Siklus 4**: Program Kerja + Galeri Foto.

---
**Status Deployment Production**: [https://sisdamas-kkn56.vercel.app](https://sisdamas-kkn56.vercel.app) (READY, 0 Error).
