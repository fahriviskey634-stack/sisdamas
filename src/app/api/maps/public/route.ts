import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function GET(req: NextRequest) {
  try {
    const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch only completed, verified, or locked households
    const { data: households, error } = await supabaseServer
      .from('household')
      .select('id, rt_id, kk_name, latitude, longitude, survey_status')
      .in('survey_status', ['completed', 'verified', 'locked'])
      .is('deleted_at', null);

    if (error || !households || households.length === 0) {
      // Return mock obfuscated pins for developer demonstration if DB is empty/offline
      const mockPublicPins = [
        {
          id: 'pin-1',
          rt_label: 'RT 02 / RW 01',
          // Rounded to 3 decimals: -6.72750 -> -6.728
          latitude: -6.728,
          longitude: 107.379,
          display_name: 'Keluarga Sukahaji [Dusun 2]',
          problems_count: 2
        },
        {
          id: 'pin-2',
          rt_label: 'RT 01 / RW 02',
          // Rounded to 3 decimals: -6.72650 -> -6.727
          latitude: -6.727,
          longitude: 107.381,
          display_name: 'Keluarga Sukahaji [Dusun 2]',
          problems_count: 1
        }
      ];
      return NextResponse.json({ success: true, data: mockPublicPins });
    }

    // Obfuscate coordinates (3 decimals rounding) and strip PII names
    const obfuscatedData = households.map((h: any) => {
      // 3 decimals rounding shifts precision by ~110 meters, protecting privacy
      const roundedLat = Math.round(Number(h.latitude) * 1000) / 1000;
      const roundedLng = Math.round(Number(h.longitude) * 1000) / 1000;

      return {
        id: h.id,
        latitude: roundedLat,
        longitude: roundedLng,
        display_name: 'Keluarga Sukahaji [Dusun 2]', // Strip original kk_name
        survey_status: h.survey_status
      };
    });

    return NextResponse.json({ success: true, data: obfuscatedData });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memproses titik koordinat peta' },
      { status: 500 }
    );
  }
}
