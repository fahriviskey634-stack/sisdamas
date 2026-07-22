export interface DraftSurvey {
  client_uuid: string;
  rt_id: string;
  rt_label: string;
  kk_name: string;
  kk_number: string;
  latitude: number;
  longitude: number;
  gps_accuracy: number;
  family_size: number;
  housing_status: string;
  housing_condition: string;
  welfare_level?: string;
  education_level?: string;
  main_job?: string;
  problems: { category: string; description: string }[];
  potentials: { category: string; description: string }[];
  photo_url: string; // DataURI compressed image
  surveyor_id: string;
}

export interface PriorityItem {
  id: string;
  problem_text: string;
  category: string;
  rt_label: string;
  urgency: number;
  seriousness: number;
  growth: number;
  total_score: number;
  rank?: number;
  a_score?: number;
  b_score?: number;
  c_score?: number;
  d_score?: number;
  total_score_abcd?: number;
  rank_abcd?: number;
  potensi_uraian?: string;
  alt_mandiri?: string;
  alt_dukungan_luar?: string;
  alt_bantuan_luar?: string;
}

export interface KKNMember {
  nim: string;
  name: string;
  gender: string;
  prodi: string;
  fakultas: string;
  email: string;
  division: string;
}

export interface RtTarget {
  id: string;
  rw: string;
  rt: string;
  target_kk: number;
  target_warga: number;
}

export interface MediaItem {
  viewUrl: string;
  downloadUrl: string;
  driveUrl: string;
  type: string;
}
