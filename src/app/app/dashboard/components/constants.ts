import { KKNMember, RtTarget } from './types';

// Data Target Sensus per RT per Dusun (Desa Sukahaji GKSTTB 2026)
// Dusun 1: 2.335 jiwa, ~760 KK | RW 02, RW 03, RW 04 (12 RT)
export const DUSUN_1_RT_TARGETS: RtTarget[] = [
  { id: 'd1-1',  rw: 'RW 02', rt: 'RT 01', target_kk: 65, target_warga: 195 },
  { id: 'd1-2',  rw: 'RW 02', rt: 'RT 02', target_kk: 64, target_warga: 195 },
  { id: 'd1-3',  rw: 'RW 02', rt: 'RT 03', target_kk: 64, target_warga: 195 },
  { id: 'd1-4',  rw: 'RW 02', rt: 'RT 04', target_kk: 62, target_warga: 190 },
  { id: 'd1-5',  rw: 'RW 03', rt: 'RT 01', target_kk: 64, target_warga: 195 },
  { id: 'd1-6',  rw: 'RW 03', rt: 'RT 02', target_kk: 63, target_warga: 190 },
  { id: 'd1-7',  rw: 'RW 03', rt: 'RT 03', target_kk: 63, target_warga: 190 },
  { id: 'd1-8',  rw: 'RW 03', rt: 'RT 04', target_kk: 62, target_warga: 190 },
  { id: 'd1-9',  rw: 'RW 04', rt: 'RT 01', target_kk: 64, target_warga: 195 },
  { id: 'd1-10', rw: 'RW 04', rt: 'RT 02', target_kk: 63, target_warga: 190 },
  { id: 'd1-11', rw: 'RW 04', rt: 'RT 03', target_kk: 63, target_warga: 190 },
  { id: 'd1-12', rw: 'RW 04', rt: 'RT 04', target_kk: 63, target_warga: 190 },
];

// Dusun 2: 3.165 jiwa, ~1.031 KK | RW 01, RW 05, RW 06, RW 11 (15 RT)
export const DUSUN_2_RT_TARGETS: RtTarget[] = [
  { id: 'd2-1',  rw: 'RW 01', rt: 'RT 01', target_kk: 72, target_warga: 215 },
  { id: 'd2-2',  rw: 'RW 01', rt: 'RT 02', target_kk: 70, target_warga: 215 },
  { id: 'd2-3',  rw: 'RW 01', rt: 'RT 03', target_kk: 70, target_warga: 215 },
  { id: 'd2-4',  rw: 'RW 01', rt: 'RT 04', target_kk: 66, target_warga: 210 },
  { id: 'd2-5',  rw: 'RW 05', rt: 'RT 01', target_kk: 68, target_warga: 210 },
  { id: 'd2-6',  rw: 'RW 05', rt: 'RT 02', target_kk: 66, target_warga: 205 },
  { id: 'd2-7',  rw: 'RW 05', rt: 'RT 03', target_kk: 66, target_warga: 205 },
  { id: 'd2-8',  rw: 'RW 05', rt: 'RT 04', target_kk: 66, target_warga: 200 },
  { id: 'd2-9',  rw: 'RW 06', rt: 'RT 01', target_kk: 68, target_warga: 210 },
  { id: 'd2-10', rw: 'RW 06', rt: 'RT 02', target_kk: 66, target_warga: 205 },
  { id: 'd2-11', rw: 'RW 06', rt: 'RT 03', target_kk: 66, target_warga: 205 },
  { id: 'd2-12', rw: 'RW 06', rt: 'RT 04', target_kk: 65, target_warga: 200 },
  { id: 'd2-13', rw: 'RW 11', rt: 'RT 01', target_kk: 75, target_warga: 225 },
  { id: 'd2-14', rw: 'RW 11', rt: 'RT 02', target_kk: 75, target_warga: 225 },
  { id: 'd2-15', rw: 'RW 11', rt: 'RT 03', target_kk: 72, target_warga: 220 },
];

// Dusun 3: 2.683 jiwa, ~870 KK | RW 07, RW 08, RW 09, RW 10 (12 RT)
export const DUSUN_3_RT_TARGETS: RtTarget[] = [
  { id: 'd3-1',  rw: 'RW 07', rt: 'RT 01', target_kk: 74, target_warga: 225 },
  { id: 'd3-2',  rw: 'RW 07', rt: 'RT 02', target_kk: 73, target_warga: 225 },
  { id: 'd3-3',  rw: 'RW 07', rt: 'RT 03', target_kk: 73, target_warga: 225 },
  { id: 'd3-4',  rw: 'RW 08', rt: 'RT 01', target_kk: 73, target_warga: 225 },
  { id: 'd3-5',  rw: 'RW 08', rt: 'RT 02', target_kk: 72, target_warga: 220 },
  { id: 'd3-6',  rw: 'RW 08', rt: 'RT 03', target_kk: 72, target_warga: 220 },
  { id: 'd3-7',  rw: 'RW 09', rt: 'RT 01', target_kk: 73, target_warga: 225 },
  { id: 'd3-8',  rw: 'RW 09', rt: 'RT 02', target_kk: 72, target_warga: 220 },
  { id: 'd3-9',  rw: 'RW 09', rt: 'RT 03', target_kk: 72, target_warga: 220 },
  { id: 'd3-10', rw: 'RW 10', rt: 'RT 01', target_kk: 73, target_warga: 225 },
  { id: 'd3-11', rw: 'RW 10', rt: 'RT 02', target_kk: 72, target_warga: 220 },
  { id: 'd3-12', rw: 'RW 10', rt: 'RT 03', target_kk: 70, target_warga: 214 },
];

export const DEFAULT_RT_TARGETS = DUSUN_2_RT_TARGETS;

export const OFFICIAL_RT_RW_OPTIONS_DUSUN_1 = [
  'RT 01 / RW 02', 'RT 02 / RW 02', 'RT 03 / RW 02', 'RT 04 / RW 02',
  'RT 01 / RW 03', 'RT 02 / RW 03', 'RT 03 / RW 03', 'RT 04 / RW 03',
  'RT 01 / RW 04', 'RT 02 / RW 04', 'RT 03 / RW 04', 'RT 04 / RW 04'
];

export const OFFICIAL_RT_RW_OPTIONS_DUSUN_2 = [
  'RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01', 'RT 04 / RW 01',
  'RT 01 / RW 05', 'RT 02 / RW 05', 'RT 03 / RW 05', 'RT 04 / RW 05',
  'RT 01 / RW 06', 'RT 02 / RW 06', 'RT 03 / RW 06', 'RT 04 / RW 06',
  'RT 01 / RW 11', 'RT 02 / RW 11', 'RT 03 / RW 11'
];

export const OFFICIAL_RT_RW_OPTIONS_DUSUN_3 = [
  'RT 01 / RW 07', 'RT 02 / RW 07', 'RT 03 / RW 07',
  'RT 01 / RW 08', 'RT 02 / RW 08', 'RT 03 / RW 08',
  'RT 01 / RW 09', 'RT 02 / RW 09', 'RT 03 / RW 09',
  'RT 01 / RW 10', 'RT 02 / RW 10', 'RT 03 / RW 10'
];

export const OFFICIAL_RT_RW_OPTIONS = OFFICIAL_RT_RW_OPTIONS_DUSUN_2;

// Master Palette Warna per Kelompok (Palette 57 dari palete 57.jpeg)
export const GROUP_PALETTES = {
  '55': {
    group: '55',
    name: 'Kelompok 55 - Dusun 1',
    dusun: 'Dusun 1',
    primary: 'from-blue-900 via-indigo-900 to-slate-900',
    headerBg: 'bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900',
    cardBorder: 'border-blue-500/20',
    accentColor: '#0284C7',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
    ketuaName: 'Muhammad Al Afgani',
    ketuaNim: '1235030147'
  },
  '56': {
    group: '56',
    name: 'Kelompok 56 - Dusun 2',
    dusun: 'Dusun 2',
    primary: 'from-[#092430] via-teal-900 to-teal-950',
    headerBg: 'bg-gradient-to-r from-[#092430] via-[#0D4B56] to-teal-900',
    cardBorder: 'border-teal-500/20',
    accentColor: '#0D9488',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    btnPrimary: 'bg-teal-600 hover:bg-teal-500 text-white',
    ketuaName: 'Arpan Maulana',
    ketuaNim: '1231030055'
  },
  '57': {
    group: '57',
    name: 'Kelompok 57 - Dusun 3',
    dusun: 'Dusun 3',
    primary: 'from-[#450A0A] via-[#881337] to-[#450A0A]',
    headerBg: 'bg-gradient-to-r from-[#78350F] via-[#991B1B] to-[#780000]',
    cardBorder: 'border-amber-500/30',
    accentColor: '#D97706',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    btnPrimary: 'bg-amber-600 hover:bg-amber-500 text-white',
    ketuaName: 'Hilman Farid',
    ketuaNim: '1232050134'
  }
};

// Daftar 43 Mahasiswa Resmi (Kelompok 55, 56, 57)
export const KKN_MEMBERS: KKNMember[] = [
  // --- KELOMPOK 55 (DUSUN 1) ---
  { nim: '1235030147', name: 'Muhammad Al Afgani', gender: 'L', prodi: 'S1 - Sastra Inggris', fakultas: 'Adab dan Humaniora', email: 'alafgani@sukahaji-official.id', division: 'Ketua (BPH)', group: '55', dusun: 'Dusun 1', isKetua: true },
  { nim: '1231060051', name: 'Agi bill Busyro dalimunthe', gender: 'L', prodi: 'S1 - Ilmu Hadits', fakultas: 'Ushuluddin', email: 'agi@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1239230140', name: 'Ersa Sofwatul Atqiyya', gender: 'P', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ersa@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1237050038', name: 'Fawwaz fadel rahman', gender: 'L', prodi: 'S1 - Teknik Informatika', fakultas: 'Sains dan Teknologi', email: 'fawwaz@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1235060068', name: 'Hana Farah Qurrotu Aini', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hana@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1239240124', name: 'Jasmine Fakhirah Rahadiani', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'jasmine@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1233010095', name: 'Muhammad Akbar Ilham Zaki', gender: 'L', prodi: 'S1 - Hukum Keluarga', fakultas: 'Syariah dan Hukum', email: 'akbar@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1234040037', name: 'Najla Khayyarah', gender: 'P', prodi: 'S1 - Pengembangan Masyarakat Islam', fakultas: 'Dakwah dan Komunikasi', email: 'najla@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1234010088', name: 'Nida Rahmawati Salsabila', gender: 'P', prodi: 'S1 - Bimbingan Konseling Islam', fakultas: 'Dakwah dan Komunikasi', email: 'nida@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1232100016', name: 'Nisa Azkiya Rahmy', gender: 'P', prodi: 'S1 - Pendidikan Islam Anak Usia Dini', fakultas: 'Tarbiyah dan Keguruan', email: 'nisa@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1232090121', name: 'Nur Rahmadani Fadillah', gender: 'P', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nur@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1238030110', name: 'Rafi Achmad', gender: 'L', prodi: 'S1 - Sosiologi', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'rafi@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1233060115', name: 'Syarif Mukhtar', gender: 'L', prodi: 'S1 - Hukum Pidana Islam', fakultas: 'Syariah dan Hukum', email: 'syarif@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },
  { nim: '1237060043', name: 'Zaina Izdihar Zahira', gender: 'P', prodi: 'S1 - Agroteknologi', fakultas: 'Sains dan Teknologi', email: 'zaina@sukahaji-official.id', division: 'Anggota Tim', group: '55', dusun: 'Dusun 1' },

  // --- KELOMPOK 56 (DUSUN 2) ---
  { nim: '1231030055', name: 'Arpan Maulana', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arpan@sukahaji-official.id', division: 'Ketua (BPH)', group: '56', dusun: 'Dusun 2', isKetua: true },
  { nim: '1234060108', name: 'Aisyah Shofa Aini', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'aisyah@sukahaji-official.id', division: 'Sekretaris (BPH)', group: '56', dusun: 'Dusun 2' },
  { nim: '1237010003', name: 'Tifa Astrianti', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'tifa@sukahaji-official.id', division: 'Bendahara (BPH)', group: '56', dusun: 'Dusun 2' },
  { nim: '1235060059', name: 'Hani Husnul Nuwat', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hani@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1232040021', name: 'Indah Sri Rahayu', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indah@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1232050026', name: 'Hasna Khairinisa Asy Syifa', gender: 'P', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hasna@sukahaji-official.id', division: 'Divisi Acara', group: '56', dusun: 'Dusun 2' },
  { nim: '1238010111', name: 'Ilya Hanifah Hakim', gender: 'P', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'ilya@sukahaji-official.id', division: 'Divisi Media & PDD', group: '56', dusun: 'Dusun 2' },
  { nim: '1239230099', name: 'Evan Fadhil Al Akbar', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'evan@sukahaji-official.id', division: 'Divisi Media & PDD', group: '56', dusun: 'Dusun 2' },
  { nim: '1235020162', name: 'Hilya Izza Fitriani', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilya@sukahaji-official.id', division: 'Divisi Media & PDD', group: '56', dusun: 'Dusun 2' },
  { nim: '1239240038', name: 'Kayyis Yasra Ismaya', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'kayyis@sukahaji-official.id', division: 'Divisi Humas', group: '56', dusun: 'Dusun 2' },
  { nim: '1237030018', name: 'Fahry Rizky Samsudin', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fahri@sukahaji-official.id', division: 'Divisi Humas', group: '56', dusun: 'Dusun 2' },
  { nim: '1236000005', name: 'Nova Aulia Rahmawan', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'nova@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1232090080', name: 'Nurdin', gender: 'L', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nurdin@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1231040133', name: 'Hanifah Mauludiah', gender: 'P', prodi: 'S1 - Tasawuf dan Psikoterapi', fakultas: 'Ushuluddin', email: 'hanifah@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },
  { nim: '1239240280', name: 'Ridwan Firmansyah', gender: 'L', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'ridwan@sukahaji-official.id', division: 'Divisi Logistik', group: '56', dusun: 'Dusun 2' },

  // --- KELOMPOK 57 (DUSUN 3) ---
  { nim: '1232050134', name: 'Hilman Farid', gender: 'L', prodi: 'S1 - Pendidikan Matematika', fakultas: 'Tarbiyah dan Keguruan', email: 'hilman@sukahaji-official.id', division: 'Ketua (BPH)', group: '57', dusun: 'Dusun 3', isKetua: true },
  { nim: '1234060095', name: 'Ajeng Dwi Meilianie', gender: 'P', prodi: 'S1 - Ilmu Komunikasi Humas', fakultas: 'Dakwah dan Komunikasi', email: 'ajeng@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1231030032', name: 'Arya Ridwan Alfarisy', gender: 'L', prodi: 'S1 - Ilmu Al-Qur\'an dan Tafsir', fakultas: 'Ushuluddin', email: 'arya@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1239230222', name: 'Fadhil Muhammad Yasir', gender: 'L', prodi: 'S1 - Manajemen Keuangan Syariah', fakultas: 'Ekonomi dan Bisnis Islam', email: 'fadhil@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1237030032', name: 'Fariel Rivaldi', gender: 'L', prodi: 'S1 - Fisika', fakultas: 'Sains dan Teknologi', email: 'fariel@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1235060007', name: 'Hanum Alya Salsabila', gender: 'P', prodi: 'S1 - Ilmu Perpustakaan dan Informasi Islam', fakultas: 'Adab dan Humaniora', email: 'hanum@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1235020128', name: 'Hilya Sakinah Najah', gender: 'P', prodi: 'S1 - Bahasa dan Sastra Arab', fakultas: 'Adab dan Humaniora', email: 'hilyanajah@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1232040161', name: 'Indira Rahma Fatika', gender: 'P', prodi: 'S1 - Pendidikan Bahasa Inggris', fakultas: 'Tarbiyah dan Keguruan', email: 'indira@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1238010147', name: 'Jembar Budi Sampurna', gender: 'L', prodi: 'S1 - Administrasi Publik', fakultas: 'Ilmu Sosial dan Ilmu Politik', email: 'jembar@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1239240092', name: 'Khaira Almaratu Assyafa', gender: 'P', prodi: 'S1 - Manajemen (FEBI)', fakultas: 'Ekonomi dan Bisnis Islam', email: 'khaira@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1235010148', name: 'Neng Popi Pitria Putri', gender: 'P', prodi: 'S1 - Sejarah dan Peradaban Islam', fakultas: 'Adab dan Humaniora', email: 'nengpopi@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1232090177', name: 'Nuri Fauziyah', gender: 'P', prodi: 'S1 - Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Tarbiyah dan Keguruan', email: 'nuri@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1236000111', name: 'Olivia Agustina Dwiyanti', gender: 'P', prodi: 'S1 - Psikologi', fakultas: 'Psikologi', email: 'olivia@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
  { nim: '1237010008', name: 'Umayyah Syihab', gender: 'P', prodi: 'S1 - Matematika', fakultas: 'Sains dan Teknologi', email: 'umayyah@sukahaji-official.id', division: 'Anggota Tim', group: '57', dusun: 'Dusun 3' },
];
