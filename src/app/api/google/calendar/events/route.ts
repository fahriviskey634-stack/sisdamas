import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/googleAuth';
import fs from 'fs';
import path from 'path';

// Parse the local ICS file to serve calendar events as a fail-safe backup
function parseICSFile(): any[] {
  const events: any[] = [];
  try {
    const icsPath = path.join(process.cwd(), 'Kalender kkn 56.ics');
    if (!fs.existsSync(icsPath)) return [];

    const fileContent = fs.readFileSync(icsPath, 'utf8');
    const lines = fileContent.split(/\r?\n/);
    
    let currentEvent: any = null;
    
    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent && currentEvent.summary) {
          events.push({
            id: `ics-${events.length}-${Date.now()}`,
            summary: currentEvent.summary,
            description: currentEvent.description || 'Agenda Resmi KKN 56 Sukahaji',
            start: { date: currentEvent.startDate },
            end: { date: currentEvent.endDate },
            source: 'ics'
          });
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12).trim();
        } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
          const dateRaw = line.substring(19).trim(); // YYYYMMDD
          if (dateRaw.length >= 8) {
            currentEvent.startDate = `${dateRaw.substring(0, 4)}-${dateRaw.substring(4, 6)}-${dateRaw.substring(6, 8)}`;
          }
        } else if (line.startsWith('DTEND;VALUE=DATE:')) {
          const dateRaw = line.substring(17).trim(); // YYYYMMDD
          if (dateRaw.length >= 8) {
            currentEvent.endDate = `${dateRaw.substring(0, 4)}-${dateRaw.substring(4, 6)}-${dateRaw.substring(6, 8)}`;
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to parse ICS file:", err);
  }
  return events;
}

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

    let gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    // Check if local credentials file exists
    const jsonPath = path.join(process.cwd(), 'gen-lang-client-0624061505-69c98224148d.json');
    if (fs.existsSync(jsonPath)) {
      gcpKey = fs.readFileSync(jsonPath, 'utf8');
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Check for developer fallback / offline mode
    if (!gcpKey || gcpKey.includes('placeholder') || calendarId.includes('placeholder')) {
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

    const eventPayload = {
      summary: title,
      description: description || 'Dibuat otomatis oleh Sistem Informasi KKN Sisdamas Sukahaji Kelompok 56',
      start: {
        date: start_date,
        timeZone: 'Asia/Jakarta'
      },
      end: {
        date: end_date,
        timeZone: 'Asia/Jakarta'
      }
    };

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
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
    const icsEvents = parseICSFile();
    let apiEvents: any[] = [];

    let gcpKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const jsonPath = path.join(process.cwd(), 'gen-lang-client-0624061505-69c98224148d.json');
    if (fs.existsSync(jsonPath)) {
      gcpKey = fs.readFileSync(jsonPath, 'utf8');
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Attempt to fetch from live Google Calendar API
    if (gcpKey && !gcpKey.includes('placeholder') && !calendarId.includes('placeholder')) {
      try {
        const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/calendar.readonly']);
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?orderBy=startTime&singleEvents=true`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          },
          next: { revalidate: 60 } // cache for 1 minute
        });

        if (res.ok) {
          const data = await res.json();
          apiEvents = (data.items || []).map((item: any) => ({
            id: item.id,
            summary: item.summary || 'Kegiatan Tanpa Judul',
            description: item.description || '',
            start: item.start || {},
            end: item.end || {},
            htmlLink: item.htmlLink || '',
            source: 'google'
          }));
        }
      } catch (apiErr) {
        console.warn("Failed to fetch from live Google Calendar API, falling back to ICS:", apiErr);
      }
    }

    // Merge events, removing duplicates by summary (to prioritize Google version if overlap)
    const mergedMap = new Map<string, any>();
    
    // First seed with ICS events
    for (const evt of icsEvents) {
      mergedMap.set(evt.summary.toLowerCase(), evt);
    }
    
    // Overwrite or append with live API events
    for (const evt of apiEvents) {
      mergedMap.set(evt.summary.toLowerCase(), evt);
    }

    const mergedEvents = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = a.start?.date || a.start?.dateTime || '';
      const dateB = b.start?.date || b.start?.dateTime || '';
      return dateA.localeCompare(dateB);
    });

    return NextResponse.json({
      success: true,
      events: mergedEvents
    });

  } catch (err: any) {
    console.error("Google Calendar GET route error:", err);
    return NextResponse.json(
      { success: false, error: err.message, events: [] },
      { status: 500 }
    );
  }
}
