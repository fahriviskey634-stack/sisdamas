import { NextResponse } from 'next/server';

export async function GET() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  return NextResponse.json({ calendarId });
}
