import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        let refreshToken = searchParams.get('refreshToken');

        // Handle cases where localStorage returned null/undefined and it was passed as a string
        if (refreshToken === 'null' || refreshToken === 'undefined') {
            refreshToken = null;
        }

        const tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        if (!tokenToUse || tokenToUse === 'null') {
            return NextResponse.json({ error: 'No authentication token available.' }, { status: 401 });
        }

        // Initialize OAuth2 Client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            refresh_token: tokenToUse
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // List events from the primary calendar
        // We filter for events created by this app by searching for the powered by tag
        const response: any = await calendar.events.list({
            calendarId: 'primary',
            q: 'Powered by Calendrian',
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        // Map to a cleaner structure for the dashboard
        const formattedEvents = events.map((item: any) => ({
            id: item.id,
            summary: item.summary,
            description: item.description,
            start: item.start?.dateTime || item.start?.date,
            end: item.end?.dateTime || item.end?.date,
            location: item.location,
            attendeeCount: item.attendees?.length || 0,
            htmlLink: item.htmlLink
        })).sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime());

        return NextResponse.json({
            success: true,
            events: formattedEvents
        });

    } catch (error: any) {
        console.error('Error listing events:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
