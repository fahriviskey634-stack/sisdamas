import { KKNMember, RtTarget } from './types';

// Data Target Sensus per RT — Dusun 2, Desa Sukahaji (Sumber: GKSTTB 2026)
// Dusun 2: 3.165 jiwa, ~1.031 KK | RW 01 (4 RT), RW 05 (4 RT), RW 06 (4 RT), RW 11 (3 RT)
export const DEFAULT_RT_TARGETS: RtTarget[] = [
  // RW 01 — 4 RT ≈ 855 jiwa, 278 KK
  { id: '1',  rw: 'RW 01', rt: 'RT 01', target_kk: 72, target_warga: 215 },
  { id: '2',  rw: 'RW 01', rt: 'RT 02', target_kk: 70, target_warga: 215 },
  { id: '3',  rw: 'RW 01', rt: 'RT 03', target_kk: 70, target_warga: 215 },
  { id: '4',  rw: 'RW 01', rt: 'RT 04', target_kk: 66, target_warga: 210 },
  // RW 05 — 4 RT ≈ 820 jiwa, 266 KK
  { id: '5',  rw: 'RW 05', rt: 'RT 01', target_kk: 68, target_warga: 210 },
  { id: '6',  rw: 'RW 05', rt: 'RT 02', target_kk: 66, target_warga: 205 },
  { id: '7',  rw: 'RW 05', rt: 'RT 03', target_kk: 66, target_warga: 205 },
  { id: '8',  rw: 'RW 05', rt: 'RT 04', target_kk: 66, target_warga: 200 },
  // RW 06 — 4 RT ≈ 820 jiwa, 265 KK
  { id: '9',  rw: 'RW 06', rt: 'RT 01', target_kk: 68, target_warga: 210 },
  { id: '10', rw: 'RW 06', rt: 'RT 02', target_kk: 66, target_warga: 205 },
  { id: '11', rw: 'RW 06', rt: 'RT 03', target_kk: 66, target_warga: 205 },
  { id: '12', rw: 'RW 06', rt: 'RT 04', target_kk: 65, target_warga: 200 },
  { id: '13', rw: 'RW 11', rt: 'RT 01', target_kk: 75, target_warga: 225 },
  { id: '14', rw: 'RW 11', rt: 'RT 02', target_kk: 75, target_warga: 225 },
  { id: '15', rw: 'RW 11', rt: 'RT 03', target_kk: 72, target_warga: 220 },
];

export const OFFICIAL_RT_RW_OPTIONS = [
  'RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01', 'RT 04 / RW 01',
  'RT 01 / RW 05', 'RT 02 / RW 05', 'RT 03 / RW 05', 'RT 04 / RW 05',
  'RT 01 / RW 06', 'RT 02 / RW 06', 'RT 03 / RW 06', 'RT 04 / RW 06',
  'RT 01 / RW 11', 'RT 02 / RW 11', 'RT 03 / RW 11'
];

export const KKN_MEMBERS: KKNMember[] = [
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
