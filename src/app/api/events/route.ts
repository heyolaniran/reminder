import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const accessKey = req.headers.get('x-access-key');

        if (!accessKey) {
            return NextResponse.json({ error: 'Missing access key' }, { status: 401 });
        }

        // Direct query to Supabase instead of internal fetch
        const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('masterKey', accessKey);

        console.log("access key", accessKey)

        console.log("payment data", paymentData)

        if (paymentError || !paymentData || paymentData.length === 0) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }

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

        const visitorToken = searchParams.get('visitorToken');

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // List events from the primary calendar
        // We filter for events created by this app by searching for the powered by tag
        // And we filter for the specific visitor using hidden extended properties

        // if the visitor is admin show all events else show only the events of the visitor
        const isAdmin = paymentData[0].view === "ADMIN"

        // select event where the event date is at least older than 7 days from now
        const response: any = await calendar.events.list({
            calendarId: 'primary',
            q: 'Powered by Calendrian',
            privateExtendedProperty: isAdmin ? undefined : [`visitor_token=${visitorToken || 'default'}`],
            maxResults: 50,
            singleEvents: true,
            timeMin: isAdmin ? undefined : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
