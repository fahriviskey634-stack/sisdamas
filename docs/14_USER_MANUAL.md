# SISDAMAS Digital Platform
## Panduan Pengguna (User Manual)

| | |
|---|---|
| **Dokumen** | 14 — Panduan Pengguna |
| **Versi** | 1.0 |
| **Status** | Draft — Siap Digunakan |
| **Pendahulu** | 00_PROJECT_FOUNDATION s.d. 13_DEPLOYMENT_OPERATIONS |
| **Tim Penyusun** | Tim Edukasi dan Pendampingan Lapangan (Senior Technical Writer, UX Documentation, Adoption Consultant, GIS Specialist, Field Operations Expert) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Sasaran Pengguna** | Mahasiswa KKN Kelompok 56, Dosen Pembimbing Lapangan (DPL), dan Aparat Desa Sukahaji |
| **Bahasa** | Bahasa Indonesia (Profesional dan Operasional) |

> **Peran Dokumen:** Panduan ini disusun untuk memberikan petunjuk operasional teknis penggunaan Platform Digital SISDAMAS kepada seluruh anggota tim KKN Kelompok 56 di Dusun 2, Desa Sukahaji. Panduan ini menjelaskan alur kerja, pengumpulan GPS, sinkronisasi offline, pemetaan, pencatatan prioritas program, langkah penanganan masalah (troubleshooting), lembar centang lapangan (field checklists), dan 30+ Tanya Jawab (FAQ).

---

## Daftar Isi

1. [Peran Pengguna (User Roles)](#1-peran-pengguna-user-roles)
2. [Model Kepemilikan Data (Ownership Model)](#2-model-kepemilikan-data-ownership-model)
3. [Siklus Kunci Data (Data Lock Workflow)](#3-siklus-kunci-data-data-lock-workflow)
4. [Persiapan Awal (Getting Started)](#4-persiapan-awal-getting-started)
5. [Alur Kerja Survei (Survey Workflow)](#5-alur-kerja-survei-survey-workflow)
6. [Manajemen Rumah Tangga (Household Management)](#6-manajemen-rumah-tangga-household-management)
7. [Panduan Pengambilan GPS (GPS Capture Guide)](#7-panduan-pengambilan-gps-gps-capture-guide)
8. [Modul Peta GIS (Map Module)](#8-modul-peta-gis-map-module)
9. [Dashboard & Statistik](#9-dashboard--statistik)
10. [Dokumentasi Kegiatan (Documentation)](#10-dokumentasi-kegiatan-documentation)
11. [Manajemen Tugas Program (Task Management)](#11-manajemen-tugas-program-task-management)
12. [Laporan & Ekspor Data (Reports)](#12-laporan--ekspor-data-reports)
13. [Modul Offline (Offline Mode)](#13-modul-offline-offline-mode)
14. [Panduan Pemecahan Masalah (Troubleshooting)](#14-panduan-pemecahan-masalah-troubleshooting)
15. [Praktik Terbaik Lapangan (Field Best Practices)](#15-praktik-terbaik-lapangan-field-best-practices)
16. [Lembar Centang Lapangan (Field Checklists)](#16-lembar-centang-lapangan-field-checklists)
17. [Tanya Jawab (Frequently Asked Questions - FAQ)](#17-tanya-jawab-frequently-asked-questions---faq)
18. [Glosarium](#18-glosarium)
19. [Lampiran (Appendix)](#19-lampiran-appendix)

---

## 1. Peran Pengguna (User Roles)

Platform Digital SISDAMAS menerapkan model akses yang terdiri dari 3 peran pengguna (3-role access model) untuk menjamin keamanan data:

### 1.1 Super Administrator
*   **Jumlah Akun:** Tepat 1 (satu) akun utama.
*   **Tanggung Jawab:**
    *   Mengatur konfigurasi platform dan variabel database.
    *   Mengelola profil pengguna (menambah, menonaktifkan akun surveyor KKN).
    *   Mengimpor dan memperbarui data master (Dusun, RW, RT).
    *   Memantau integrasi API Google Drive dan Google Calendar.
    *   Melakukan verifikasi, penguncian (`lock`), dan pembukaan kunci (`unlock`) data survei.
    *   Mengakses dan mengunduh berkas log audit serta backup database PostgreSQL.

### 1.2 Anggota Tim KKN (KKN Team Member)
*   **Jumlah Akun:** 15 akun (mahasiswa Kelompok 56).
*   **Tanggung Jawab & Hak Akses:**
    *   Masuk (login) ke dashboard internal platform.
    *   Memasukkan data survei rumah tangga via form wizard.
    *   Mengambil koordinat lokasi GPS pintu rumah warga.
    *   Mengunggah foto dokumentasi rumah dan foto kegiatan per siklus.
    *   Membuat tugas program kerja, menunjuk penanggung jawab (PIC), dan meng-update progress.
    *   Membaca, mengubah, dan menghapus data yang **dibuat oleh dirinya sendiri**.
*   **Batasan (Restricted Actions):**
    *   Tidak dapat melihat, mengubah, atau menghapus data milik anggota tim lain.
    *   Tidak dapat mengakses halaman log audit atau mengunduh backup database.
    *   Tidak dapat mengubah data master geografi atau konfigurasi serverless.

### 1.3 Pengunjung Publik (Public Visitor)
*   **Jumlah Akun:** Tanpa login (terbuka untuk masyarakat umum, dosen DPL, dan perangkat desa).
*   **Tanggung Jawab & Hak Akses:**
    *   Melihat profil KKN Kelompok 56 dan profil wilayah Desa Sukahaji.
    *   Melihat lini masa kegiatan publik dan galeri foto kegiatan.
    *   Mengakses tautan media sosial KKN (Instagram, TikTok).
    *   Melihat peta sebaran publik `/peta` (pin lokasi terobfuskasi 3 desimal tanpa menampilkan nama kepala keluarga).
*   **Batasan:** Tidak dapat menambah, mengubah, atau menghapus data apa pun dalam sistem.

---

## 2. Model Kepemilikan Data (Ownership Model)

Untuk mencegah konflik data saat 15 mahasiswa menginput data di wilayah RW yang sama, platform menerapkan aturan kepemilikan yang ketat:

*   Setiap entitas data (data survei, catatan sticky note, tugas program, dan foto) mencatat ID pembuat (`created_by`) berdasarkan token JWT aktif.
*   Tombol **Edit** dan **Hapus** hanya akan muncul di antarmuka jika ID pengguna yang sedang login sama dengan ID pembuat data tersebut, atau pengguna adalah Super Administrator.
*   Aturan ini mencegah terjadinya penimpaan data yang tidak disengaja oleh sesama rekan surveyor di lapangan.

---

## 3. Siklus Kunci Data (Data Lock Workflow)

Data survei rumah tangga memiliki siklus status untuk menjamin validitas data:

```
[ Draft ] ──(Disimpan lokal)──> [ Submitted ] ──(Terkirim ke DB)──> [ Verified ] ──(Diperiksa Admin)──> [ Locked ]
```

1.  **Draft:** Data disimpan di penyimpanan lokal ponsel (`localStorage`). Masih bisa diubah bebas secara offline.
2.  **Submitted:** Data berhasil disinkronisasi ke database Supabase. Surveyor pembuat masih dapat mengedit data jika terdapat kekeliruan.
3.  **Verified:** Admin memeriksa kelengkapan data (koordinat tepat, foto terunggah).
4.  **Locked:** Status akhir. Data dikunci permanen oleh Super Admin. Setelah berstatus *Locked*, **anggota KKN tidak dapat mengubah atau menghapus data tersebut**. Kunci hanya dapat dibuka kembali oleh Super Administrator.
5.  **Tujuan Penguncian:** Menjamin data survei tidak bergeser atau terhapus secara tidak sengaja ketika tim mulai menyusun matriks prioritas program (Siklus 3) dan laporan akhir LPJ.

---

## 4. Persiapan Awal (Getting Started)

### 4.1 Perangkat yang Didukung
*   **Ponsel/Tablet:** Semua smartphone Android (versi minimal Android 10) dengan browser Google Chrome aktif.
*   **Laptop/Komputer:** Windows/macOS dengan Chrome, Edge, atau Firefox untuk kebutuhan administrasi data oleh Admin.

### 4.2 Persyaratan Teknis
*   **GPS:** Fitur lokasi GPS pada ponsel harus diaktifkan dalam mode akurasi tinggi (*High Accuracy / Google Location Accuracy*).
*   **Kamera:** Izin akses kamera browser harus disetujui (*Allowed*) saat platform meminta akses untuk memotret rumah warga.
*   **Internet:** Sinyal internet minimal 3G untuk proses login dan sinkronisasi. Untuk pengisian form survei, platform dapat bekerja 100% tanpa sinyal (offline).

### 4.3 Alur Login
1.  Buka tautan: `https://sisdamas-kkn56.vercel.app`.
2.  Masukkan email dan password yang telah didaftarkan oleh Super Admin.
3.  Tekan tombol **Masuk**.
4.  Setelah berhasil, sistem akan mengarahkan Anda ke halaman utama Dashboard internal.

---

## 5. Alur Kerja Survei (Survey Workflow)

Surveyor wajib mengikuti 14 langkah runtut berikut saat melakukan wawancara door-to-door:

```
1. Login ➔ 2. Pilih Dusun ➔ 3. Pilih RW ➔ 4. Pilih RT ➔ 5. Pilih/Buat Rumah Tangga ➔ 6. Ambil GPS ➔ 7. Validasi Pin ➔ 8. Ambil Foto Rumah ➔ 9. Isi Form Survei ➔ 10. Simpan Draft ➔ 11. Kirim Data ➔ 12. Sinkronisasi (jika offline) ➔ 13. Verifikasi Admin ➔ 14. Locked
```

### 5.1 Penjelasan Detail Alur Survei
1.  **Login:** Pastikan sesi login aktif sebelum masuk ke wilayah survei.
2.  **Pilih Wilayah (Dusun, RW, RT):** Tentukan lokasi RT survei aktif agar data ter-scope dengan benar.
3.  **Pilih/Buat Rumah Tangga:** Cari nama Kepala Keluarga (KK). Jika belum ada dalam database, klik **Tambah Rumah Tangga Baru**.
4.  **Ambil GPS:** Berdiri tepat di depan pintu rumah warga, klik tombol **Ambil GPS**. Tunggu indikator akurasi berwarna hijau (< 10 meter).
5.  **Validasi Koordinat:** Periksa posisi pin pada peta mini form. Jika posisi bergeser, geser pin secara manual ke posisi atap rumah yang benar.
6.  **Ambil Foto Rumah:** Klik ikon kamera, potret tampak depan rumah warga secara landscape. Canvas otomatis mengompresi foto menjadi ≤800KB.
7.  **Isi Form Survei:** Lengkapi jawaban pertanyaan kondisi rumah tangga (jumlah anggota keluarga, sanitasi, pendapatan, dll.).
8.  **Simpan Draft / Kirim:** Jika sinyal tidak ada, klik **Simpan sebagai Draft**. Jika sinyal stabil, klik **Kirim Survei**.
9.  **Sinkronisasi:** Di sore hari saat kembali ke basecamp (sinyal stabil), buka menu **Sync Queue** dan klik **Sinkronisasikan Semua Data**.

---

## 6. Manajemen Rumah Tangga (Household Management)

Modul ini digunakan untuk mencatat identitas utama keluarga:

*   **Pencarian Kepala Keluarga:** Gunakan kolom pencarian di bagian atas halaman survei. Ketik nama kepala keluarga untuk memeriksa apakah rumah tersebut sudah disurvei oleh rekan tim lain.
*   **Pencegahan Data Ganda (Duplikasi):** Sistem mencatat Nomor Kartu Keluarga (`kk_number`). Jika Anda menginput KK yang sudah terdaftar, sistem akan memblokir proses simpan dan menampilkan nama surveyor yang telah menginput data tersebut sebelumnya.
*   **Aturan Foto:** Hanya diperbolehkan mengunggah 1 foto utama per rumah tangga yang menampilkan fasad depan rumah secara utuh. Foto bagian dalam rumah atau foto anggota keluarga tidak diperbolehkan demi menjaga privasi warga.

---

## 7. Panduan Pengambilan GPS (GPS Capture Guide)

Akurasi GPS sangat krusial untuk menghasilkan peta sebaran sosial yang presisi:

### 7.1 Langkah Meningkatkan Akurasi GPS
*   **Posisi Pengambilan:** Berdirilah di ruang terbuka (luar ruangan, tidak terhalang atap seng tebal atau pohon rindang besar).
*   **Tunggu Stabil:** Jangan langsung mengklik simpan begitu koordinat muncul. Biarkan browser melakukan polling GPS selama 10-15 detik hingga angka akurasi mengecil (target: < 10 meter).
*   **Masalah Sensor:** Jika GPS ponsel gagal membaca lokasi, matikan fitur GPS ponsel selama 5 detik, lalu aktifkan kembali, dan muat ulang browser (*refresh*).

---

## 8. Modul Peta GIS (Map Module)

Akses peta sebaran melalui menu **Peta Sebaran GIS** di sidebar:

*   **Filter Data:** Anda dapat memfilter marker berdasarkan Dusun, RW, RT, maupun kategori masalah (misal: menampilkan rumah tangga tanpa fasilitas air bersih).
*   **Warna Marker:**
    *   *Hijau:* Survei lengkap dan telah terverifikasi.
    *   *Kuning:* Survei berstatus *Submitted* namun belum diverifikasi Admin.
    *   *Merah:* Lokasi warga menolak survei (tanda batas wilayah).
*   **Detail Pin:** Klik pada marker untuk membuka jendela info berisi nama kepala keluarga, nama RT/RW, dan ringkasan masalah utama rumah tangga tersebut.
*   **Ekspor Data:** Super Admin dapat mengunduh data koordinat ini dalam format **GeoJSON** atau **KML** untuk diolah pada aplikasi ArcGIS atau Google Earth.

---

## 9. Dashboard & Statistik

Halaman utama dashboard menyajikan ringkasan visual real-time kemajuan KKN:

*   **Progress Bar RT/RW:** Menampilkan persentase jumlah rumah tangga yang sudah disurvei dibandingkan target total KK di Dusun 2 (target: ~120 KK).
*   **Diagram Masalah & Potensi:** Roda diagram (Pie Chart) yang otomatis mengelompokkan masalah warga paling dominan (misal: 60% masalah sampah, 20% sanitasi). Data ini menjadi dasar penentuan program kerja.
*   **Timeline Aktivitas:** Catatan log aktivitas terbaru (misal: *"Andi menambahkan survei baru di RT 01"*).

---

## 10. Dokumentasi Kegiatan (Documentation)

Selain survei rumah tangga, tim KKN wajib mengunggah dokumentasi kegiatan harian:

*   **Pengelompokan Siklus:** Unggah foto kegiatan rapat warga, survei fisik, rembug prioritas, dan eksekusi program kerja ke dalam album folder yang sesuai dengan Siklus 1, 2, 3, atau 4.
*   **Sinkronisasi Google Drive:** Setiap foto yang diunggah ke platform akan otomatis dicadangkan ke Google Drive bersama desa melalui Service Account backend.
*   **Pencarian Berkas:** Masukkan kata kunci nama kegiatan (misal: *"Rembug RT 02"*) pada kolom pencarian galeri untuk menemukan foto dokumentasi dengan cepat.

---

## 11. Manajemen Tugas Program (Task Management)

Gunakan fitur ini untuk membagi peran pengerjaan program kerja KKN:

*   **Pembuatan Tugas:** Masukkan judul tugas (misal: *"Membuat tong sampah organik"*), tautkan ke program utama, dan tentukan penanggung jawab (PIC).
*   **Pengaturan Batas Waktu (Deadline):** Pilih tanggal jatuh tempo tugas pada kalender. Tugas yang mendekati batas waktu akan memicu notifikasi peringatan di dashboard PIC yang bersangkutan.
*   **Pembaruan Status:** PIC wajib mengubah status tugas dari `Belum Dimulai` ➔ `Sedang Dikerjakan` ➔ `Selesai` seiring kemajuan program di lapangan.

---

## 12. Laporan & Ekspor Data (Reports)

Untuk menyusun Lembar Pertanggungjawaban (LPJ) KKN:

*   **Ekspor Excel:** Klik menu **Ekspor Data** di panel Admin. Browser akan mengunduh berkas spreadsheet berisi tabel lengkap survei rumah tangga (format `.xlsx`) yang siap diolah untuk tabel statistik lampiran LPJ.
*   **Ekspor PDF:** Hasilkan dokumen ringkasan profil Dusun 2 Desa Sukahaji (format `.pdf`) yang memuat grafik masalah, potensi, peta sebaran ter-obfuskasi, dan daftar program kerja Kelompok 56 yang sukses terlaksana.

---

## 13. Modul Offline (Offline Mode)

Platform ini dirancang khusus agar tetap bekerja tanpa internet di area blank spot:

*   **Penyimpanan Offline:** Saat tombol "Simpan Draft" diklik saat offline, semua isian formulir survei beserta koordinat dan foto dikompresi lalu disimpan aman di dalam memori internal browser (`localStorage`).
*   **Indikator Antrean (Sync Queue):** Muncul gelembung angka merah di menu sidebar (misal: `[ 5 ]`) yang menandakan jumlah draf yang belum terunggah ke server.
*   **Prosedur Sinkronisasi Aman:**
    1.  Kembali ke area yang memiliki sinyal internet stabil atau WiFi basecamp.
    2.  Buka menu **Antrean Sinkronisasi (Sync Queue)**.
    3.  Tekan tombol **Sinkronisasikan Sekarang**. Jangan menutup halaman browser atau mematikan ponsel hingga indikator berubah menjadi `"Sinkronisasi Berhasil"`.

---

## 14. Panduan Pemecahan Masalah (Troubleshooting)

Berikut adalah solusi praktis untuk kendala teknis yang sering ditemui di lapangan:

### 14.1 Gagal Login ke Platform
*   *Penyebab:* Password salah atau memori cookie browser penuh.
*   *Solusi:* Pastikan e-mail ditulis dengan huruf kecil semua. Jika tetap gagal, hubungi Super Admin untuk mereset password Anda via panel user management.

### 14.2 GPS Tidak Terbaca (Koordinat Kosong)
*   *Penyebab:* Izin lokasi browser dimatikan atau sensor GPS ponsel tidak aktif.
*   *Solusi:* Masuk ke pengaturan browser Chrome ➔ Setelan Situs ➔ Lokasi ➔ Aktifkan izin untuk `sisdamas-kkn56.vercel.app`. Buka aplikasi Google Maps terlebih dahulu untuk memicu sensor GPS ponsel agar aktif.

### 14.3 Akurasi GPS Sangat Buruk (>20 Meter)
*   *Penyebab:* Berada di dalam ruangan beton atau terhalang pohon besar.
*   *Solusi:* Keluarlah ke halaman rumah/ruang terbuka, tunggu 15 detik. Jika akurasi tetap buruk, gunakan fitur **Pin Manual** pada peta mini di form survei untuk meletakkan titik secara manual di atas genteng rumah warga yang sesuai.

### 14.4 Foto Gagal Diunggah
*   *Penyebab:* Koneksi internet lambat atau ukuran foto terlalu besar.
*   *Solusi:* Platform otomatis mengompresi foto. Namun jika koneksi sangat buruk, simpan survei sebagai **Draft** terlebih dahulu, lalu lakukan sinkronisasi saat berada di basecamp.

---

## 15. Praktik Terbaik Lapangan (Field Best Practices)

Demi kelancaran dan etika pengumpulan data:

*   **Etika Wawancara:** Selalu mulai dengan senyum, salam, dan membaca teks persetujuan lisan (*verbal consent*). Hormati keputusan jika warga menolak disurvei.
*   **Manajemen Baterai Ponsel:** Penggunaan GPS dan kamera terus-menerus menguras baterai. Matikan aplikasi background lain (seperti Instagram/Game), turunkan kecerahan layar ponsel menjadi 50%, dan selalu bawa Power Bank selama perjalanan survei.
*   **Penyimpanan Data Aman:** Jangan membagikan tangkapan layar (screenshot) berisi data pribadi kepala keluarga (seperti nomor KK) ke grup WhatsApp publik. Simpan data secara tertutup di dalam aplikasi.

---

## 16. Lembar Centang Lapangan (Field Checklists)

Gunakan daftar centang berikut sebagai panduan operasional harian tim:

### 16.1 Persiapan Sebelum Meninggalkan Basecamp
*   [ ] Ponsel terisi daya penuh (100%).
*   [ ] Power bank terisi daya penuh dan kabel data berfungsi.
*   [ ] Sesi login aplikasi aktif di browser Chrome.
*   [ ] Memori penyimpanan ponsel longgar (minimal kosong 500MB).
*   [ ] Membawa buku catatan fisik dan bolpoin sebagai cadangan.

### 16.2 Sebelum Memulai Wawancara Rumah Tangga
*   [ ] Memastikan nomor rumah atau RT/RW sasaran sudah benar.
*   [ ] Memposisikan diri di luar ruangan agar GPS siap melakukan polling koordinat.
*   [ ] Menyiapkan senyum dan membaca basmalah.

### 16.3 Selama Wawancara Berjalan
*   [ ] Membaca teks persetujuan lisan (Verbal Consent).
*   [ ] Memastikan persetujuan pemilik rumah sebelum mengambil foto tampak depan.
*   [ ] Mengklik tombol "Ambil GPS" dan membiarkan akurasi stabil hingga < 10 meter.
*   [ ] Mengisi seluruh pertanyaan wajib (bertanda bintang merah).

### 16.4 Sebelum Meninggalkan Rumah Warga
*   [ ] Memeriksa kembali kelengkapan isian form survei.
*   [ ] Memilih opsi "Simpan Draft" (jika offline) atau "Kirim" (jika online).
*   [ ] Mengucapkan terima kasih kepada warga atas waktu yang diberikan.

### 16.5 Sebelum Melakukan Sinkronisasi Data (Sore Hari)
*   [ ] Memastikan baterai ponsel minimal 20% (atau terhubung ke charger).
*   [ ] Memastikan koneksi internet stabil (disarankan menggunakan WiFi basecamp).
*   [ ] Membuka menu Sync Queue dan menekan tombol "Sinkronisasikan Semua".
*   [ ] Memverifikasi bahwa angka antrean merah di sidebar telah hilang (menjadi 0).

---

## 17. Tanya Jawab (Frequently Asked Questions - FAQ)

Berikut adalah 30 pertanyaan yang sering diajukan oleh pengguna:

1.  **Q: Apakah aplikasi ini berbayar?**
    *   *A:* Tidak. Seluruh infrastruktur platform dibangun menggunakan tier gratis (free tier) dari Vercel, Supabase, dan OpenStreetMap.
2.  **Q: Mengapa saya harus login terlebih dahulu?**
    *   *A:* Login diperlukan untuk mengidentifikasi kepemilikan data (ownership) dan mencegah pihak luar memasukkan data palsu.
3.  **Q: Bagaimana jika warga menolak untuk disurvei?**
    *   *A:* Hormati keputusan mereka. Jangan paksa wawancara. Di aplikasi, pilih opsi RT/RW yang dituju, buat pin lokasi di depan rumah tersebut, lalu beri tanda status `"Warga Menolak"` agar tim KKN lain tidak mendatangi rumah tersebut kembali.
4.  **Q: Mengapa foto rumah yang saya unggah buram?**
    *   *A:* Platform melakukan kompresi otomatis (resampling canvas) hingga ukuran file ≤800KB agar proses upload cepat. Hasil kompresi cukup jelas untuk mengidentifikasi kondisi rumah warga tanpa membebani penyimpanan server.
5.  **Q: Bolehkah saya memotret bagian dalam rumah warga?**
    *   *A:* Tidak boleh. Demi menjaga privasi warga, foto yang diambil hanya fasad luar rumah (tampak depan).
6.  **Q: Apakah data nomor Kartu Keluarga (KK) saya aman dalam database?**
    *   *A:* Aman. Kolom nomor KK dilindungi oleh enkripsi database dan tidak akan pernah ditampilkan di halaman publik/guest visitor.
7.  **Q: Apa yang harus saya lakukan jika ponsel saya mati di tengah-tengah survei?**
    *   *A:* Platform menyimpan draf isian form survei secara otomatis di memori lokal browser. Saat ponsel dinyalakan kembali dan browser dibuka, form akan memuat ulang data terakhir yang belum sempat Anda simpan.
8.  **Q: Mengapa peta tidak menampilkan peta satelit Google Maps?**
    *   *A:* Google Maps API memerlukan tagihan berbayar (billing key). Platform menggunakan OpenStreetMap yang 100% gratis dan open-source untuk menghemat biaya operasional KKN.
9.  **Q: Berapa batas penyimpanan foto di platform ini?**
    *   *A:* Batas penyimpanan database gratis Supabase adalah 1GB. Oleh karena itu, foto wajib dikompresi sebelum diunggah, dan Admin akan memindahkan arsip foto ke Google Drive secara berkala.
10. **Q: Apakah DPL (Dosen Pembimbing Lapangan) bisa memantau kemajuan kami?**
    *   *A:* Ya. DPL dapat membuka dashboard platform sebagai *Public Visitor* tanpa login untuk melihat statistik persentase survei dan program kerja Kelompok 56 yang sedang berjalan.
11. **Q: Bagaimana cara mendaftarkan surveyor baru?**
    *   *A:* Hanya Super Administrator yang memiliki hak akses untuk mendaftarkan akun surveyor baru melalui halaman panel manajemen user.
12. **Q: Berapa lama waktu yang dibutuhkan untuk sinkronisasi data offline?**
    *   *A:* Biasanya kurang dari 10 detik per rekor survei, tergantung pada kestabilan koneksi internet basecamp.
13. **Q: Kenapa koordinat GPS yang didapat bergeser jauh dari lokasi saya berdiri?**
    *   *A:* Sinyal GPS ponsel terdistorsi oleh gedung atau pohon besar. Tunggu beberapa detik di area terbuka, atau geser pin marker secara manual di peta mini form survei ke titik atap rumah warga yang benar.
14. **Q: Apakah data survei yang salah diinput masih bisa diedit?**
    *   *A:* Ya, selama data tersebut belum diberi status *Locked* (Terkunci) oleh Super Administrator.
15. **Q: Siapa yang berhak menghapus data survei?**
    *   *A:* Hanya surveyor pembuat data tersebut dan Super Administrator yang memiliki hak untuk melakukan penghapusan data (soft-delete).
16. **Q: Mengapa saya tidak bisa mengakses menu log audit?**
    *   *A:* Menu log audit berisi riwayat sistem yang sensitif dan hanya boleh diakses oleh akun Super Administrator untuk memantau keamanan data.
17. **Q: Apakah data warga akan hilang jika saya menghapus cache browser?**
    *   *A:* Jika data sudah disinkronisasi ke server (sync berhasil), data aman di database. Namun, jika ada draf survei offline yang belum disinkronisasi, menghapus cache browser akan menghapus draf tersebut. Pastikan lakukan sinkronisasi data terlebih dahulu sebelum membersihkan browser.
18. **Q: Bagaimana cara mengekspor data ke format Excel?**
    *   *A:* Masuk sebagai Admin, pilih menu ekspor data, lalu klik tombol **Ekspor ke Excel**. File spreadsheet otomatis diunduh ke folder download Anda.
19. **Q: Apakah data koordinat sebaran bisa dibuka di aplikasi ArcGIS?**
    *   *A:* Bisa. Administrator dapat mengunduh data koordinat berformat **GeoJSON** atau **KML** yang kompatibel langsung dengan ArcGIS, QGIS, maupun Google Earth.
20. **Q: Apa arti pin berwarna merah di peta?**
    *   *A:* Pin merah menandakan rumah warga yang menolak disurvei, berfungsi sebagai batas area survei bagi tim KKN.
21. **Q: Mengapa password sementara dari Admin tidak bisa digunakan lagi?**
    *   *A:* Password sementara memiliki batas waktu aktif 24 jam. Segera ganti password Anda pada login pertama.
22. **Q: Bagaimana jika saya lupa password akun saya?**
    *   *A:* Klik tautan "Lupa Password" di halaman login, masukkan email Anda, lalu buka e-mail untuk mengklik tautan reset password yang dikirimkan sistem.
23. **Q: Apakah aplikasi ini bisa diakses di iPhone/iOS?**
    *   *A:* Bisa. Platform dapat dibuka melalui browser Safari atau Chrome di iPhone/iPad, namun disarankan menggunakan Android untuk akurasi sensor GPS yang lebih stabil.
24. **Q: Apa itu skala prioritas USG?**
    *   *A:* USG adalah metode analisis prioritas masalah berdasarkan tiga indikator: *Urgency* (tingkat mendesak), *Seriousness* (tingkat keseriusan), dan *Growth* (tingkat perkembangan masalah).
25. **Q: Siapa yang menentukan nilai skor USG di aplikasi?**
    *   *A:* Penentuan skor (1-5) dilakukan secara bersama-sama oleh seluruh anggota tim KKN Kelompok 56 dan tokoh masyarakat Desa Sukahaji saat forum rembug warga (Siklus 3).
26. **Q: Mengapa tugas program kerja saya ditandai warna merah?**
    *   *A:* Warna merah menandakan tugas tersebut sudah mendekati atau melewati batas waktu jatuh tempo (*deadline*) dan belum diubah statusnya menjadi selesai.
27. **Q: Di mana file foto rumah warga tersimpan di Google Drive?**
    *   *A:* File otomatis tersimpan di folder bersama KKN Kelompok 56 pada sub-folder `Siklus 2 - Survei/Foto Rumah Tangga/` yang diorganisasi rapi berdasarkan nomor RT/RW.
28. **Q: Apakah pengunjung publik bisa melihat foto rumah warga?**
    *   *A:* Tidak bisa. Foto rumah warga dilindungi kebijakan keamanan database RLS dan hanya bisa dilihat oleh anggota KKN & Admin yang log in.
29. **Q: Bagaimana cara melaporkan jika ada error dalam aplikasi?**
    *   *A:* Laporkan kendala Anda kepada tim dokumentasi/Super Admin dengan menyertakan tangkapan layar error dan langkah-langkah detail sebelum error terjadi.
30. **Q: Apakah platform ini tetap bisa diakses setelah program KKN Kelompok 56 selesai?**
    *   *A:* Ya. Repositori kode dan database akan diserahkan kepada pihak desa/kampus agar bisa dimanfaatkan kembali oleh periode KKN berikutnya di Desa Sukahaji.

---

## 18. Glosarium

*   **SISDAMAS:** Pemberdayaan Masyarakat Berbasis Keberagaman dan Keadilan, metodologi KKN UIN Bandung.
*   **BaaS:** *Backend as a Service*, infrastruktur server database instan (dalam hal ini menggunakan Supabase).
*   **RLS:** *Row Level Security*, kebijakan keamanan tingkat baris tabel di database PostgreSQL.
*   **PWA:** *Progressive Web Application*, aplikasi web yang bisa diinstal di layar ponsel dan berjalan offline.
*   **USG Matrix:** Metode pembobotan prioritas berdasarkan *Urgency, Seriousness, dan Growth*.
*   **GeoJSON / KML:** Format standar berkas spasial untuk menyimpan koordinat geografis.
*   **Zod:** Pustaka validasi skema data untuk memastikan input pengguna aman dan sesuai tipe data.

---

## 19. Lampiran (Appendix)

### 19.1 Arti Kode Warna Marker di Peta
*   🟢 **Marker Hijau:** Rumah tangga selesai disurvei dan data terverifikasi aman.
*   🟡 **Marker Kuning:** Survei telah dikirim oleh surveyor, sedang menunggu antrean verifikasi Admin.
*   🔴 **Marker Merah:** Penanda wilayah batas (warga menolak disurvei).

### 19.2 Informasi Kontak Dukungan Teknis
Jika terjadi masalah mendesak pada server/database, hubungi:
*   **Super Administrator (Developer KKN Kelompok 56):** `developer.kkn56@sukahaji-official.id`

---

*Dokumen Panduan Pengguna ini dirancang berdasarkan `14_USER_MANUAL_PROMPT.md` dan patuh terhadap batasan operasional platform.*

---

**Apakah Anda ingin merevisi Panduan Pengguna ini sebelum kita melangkah ke dokumen rencana implementasi terakhir (`15_IMPLEMENTATION_PLAN.md`)?**
