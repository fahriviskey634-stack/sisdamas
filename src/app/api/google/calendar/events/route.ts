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
      { status: 550 }
    );
  }
}
