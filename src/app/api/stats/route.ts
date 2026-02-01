import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const eventId = searchParams.get('eventId');
        let refreshToken = searchParams.get('refreshToken');

        // Handle cases where localStorage returned null/undefined and it was passed as a string
        if (refreshToken === 'null' || refreshToken === 'undefined') {
            refreshToken = null;
        }

        if (!eventId) {
            return NextResponse.json({ error: 'No eventId provided' }, { status: 400 });
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

        // Get Event details including attendees
        const response: any = await calendar.events.get({
            calendarId: 'primary',
            eventId: eventId,
        });

        const attendees: any[] = response.data.attendees || [];

        const stats = {
            total: attendees.length,
            accepted: {
                count: attendees.filter((a: any) => a.responseStatus === 'accepted').length,
                emails: attendees.filter((a: any) => a.responseStatus === 'accepted').map((a: any) => a.email)
            },
            tentative: {
                count: attendees.filter((a: any) => a.responseStatus === 'tentative').length,
                emails: attendees.filter((a: any) => a.responseStatus === 'tentative').map((a: any) => a.email)
            },
            declined: {
                count: attendees.filter((a: any) => a.responseStatus === 'declined').length,
                emails: attendees.filter((a: any) => a.responseStatus === 'declined').map((a: any) => a.email)
            },
            needsAction: {
                count: attendees.filter((a: any) => a.responseStatus === 'needsAction' || !a.responseStatus).length,
                emails: attendees.filter((a: any) => a.responseStatus === 'needsAction' || !a.responseStatus).map((a: any) => a.email)
            }
        };

        return NextResponse.json({
            success: true,
            summary: response.data.summary,
            stats: stats
        });

    } catch (error: any) {
        console.error('Error fetching event stats:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
