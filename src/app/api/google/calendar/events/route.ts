import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, start_date, end_date } = body;

    if (!title || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Parameter title, start_date, dan end_date wajib diisi' },
        { status: 400 }
      );
    }

    const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Check for developer fallback / offline mode
    if (!gcpKey || gcpKey.includes('placeholder')) {
      console.log(`[Google Calendar Mock] Creating event: "${title}" (${start_date} s/d ${end_date})`);
      return NextResponse.json({
        success: true,
        mocked: true,
        message: "Milestone berhasil ditambahkan ke Google Calendar (Mode Simulasi)",
        data: {
          calendar_event_id: `mock-event-id-${Date.now()}`,
          html_link: 'https://calendar.google.com/calendar/r/eventedit',
          timestamp: new Date().toISOString()
        }
      }, { status: 201 });
    }

    // Production GCP Service Account Integration
    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/calendar.events']);

    // Call Google Calendar Events insert REST API
    const eventPayload = {
      summary: title,
      description: description || 'Dibuat otomatis oleh Sistem Informasi KKN Sisdamas Sukahaji Kelompok 56',
      start: {
        date: start_date, // YYYY-MM-DD for all-day events
        timeZone: 'Asia/Jakarta'
      },
      end: {
        date: end_date, // YYYY-MM-DD for all-day events
        timeZone: 'Asia/Jakarta'
      }
    };

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Calendar API rejected event: ${errText}`);
    }

    const createdEvent = await res.json();

    return NextResponse.json({
      success: true,
      message: "Milestone berhasil ditambahkan ke Google Calendar",
      data: {
        calendar_event_id: createdEvent.id,
        html_link: createdEvent.htmlLink,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("Google Calendar Sync Error:", err);
    return NextResponse.json(
      { error: `Gagal mencadangkan event ke Google Calendar: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Fallback if not configured
    if (!gcpKey || gcpKey.includes('placeholder')) {
      const mockEvents = [
        { id: '1', summary: 'Survey bersama DPL', start: { date: '2026-07-09' }, end: { date: '2026-07-10' } },
        { id: '2', summary: 'ngumpulin barang di ilya', start: { date: '2026-07-16' }, end: { date: '2026-07-17' } },
        { id: '3', summary: 'Pembukaan dan pra siklus', start: { date: '2026-07-21' }, end: { date: '2026-07-22' } },
        { id: '4', summary: 'Rembuk warga SIKLUS 1', start: { date: '2026-07-22' }, end: { date: '2026-07-23' } },
        { id: '5', summary: 'LIBUR BESAR', start: { date: '2026-07-23' }, end: { date: '2026-07-24' } },
        { id: '6', summary: 'SIKLUS 1 & 2', start: { date: '2026-07-24' }, end: { date: '2026-07-27' } }
      ];
      return NextResponse.json({ success: true, mocked: true, events: mockEvents });
    }

    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/calendar.readonly']);
    
    // Call Google Calendar API to list events
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?orderBy=startTime&singleEvents=true`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Calendar API rejected list request: ${errText}`);
    }

    const data = await res.json();
    
    // Obfuscate or format calendar items list
    const formattedEvents = (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || 'Kegiatan Tanpa Judul',
      description: item.description || '',
      start: item.start || {},
      end: item.end || {},
      htmlLink: item.htmlLink || ''
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents
    });

  } catch (err: any) {
    console.error("Google Calendar list error:", err);
    return NextResponse.json(
      { success: false, error: err.message, events: [] },
      { status: 500 }
    );
  }
}
