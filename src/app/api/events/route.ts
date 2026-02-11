import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const accessKey = req.headers.get('x-access-key');

        if (!accessKey) {
            return NextResponse.json({ error: 'Missing access key' }, { status: 401 });
        }

        // Direct query to Supabase
        const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('masterKey', accessKey);

        if (paymentError || !paymentData || paymentData.length === 0) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }

        const isAdmin = paymentData[0].view === "ADMIN";
        const searchParams = req.nextUrl.searchParams;
        const visitorToken = searchParams.get('visitorToken');

        // 1. Fetch Scheduled Events from Supabase
        let scheduledQuery = supabase.from('scheduled_events').select('*');
        if (!isAdmin) {
            scheduledQuery = scheduledQuery.eq('visitor_token', visitorToken || 'default');
        }
        const { data: scheduledItems, error: scheduledError } = await scheduledQuery;

        if (scheduledError) {
            console.error('Error fetching scheduled events:', scheduledError);
        }

        const formattedScheduled = (scheduledItems || []).map((item: any) => ({
            id: item.id,
            summary: item.event_details.title,
            description: item.event_details.description,
            start: item.event_details.startDate,
            end: item.event_details.endDate,
            location: item.event_details.location,
            attendeeCount: item.emails.length,
            htmlLink: '#',
            isScheduled: true,
            status: item.status,
            scheduledFor: item.scheduled_for
        }));

        // 2. Fetch Sent Events from Google Calendar
        let refreshToken = searchParams.get('refreshToken');
        if (refreshToken === 'null' || refreshToken === 'undefined') {
            refreshToken = null;
        }

        const tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        let formattedGoogleEvents: any[] = [];

        if (tokenToUse && tokenToUse !== 'null') {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );

            oauth2Client.setCredentials({ refresh_token: tokenToUse });

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

            const googleResponse: any = await calendar.events.list({
                calendarId: 'primary',
                q: 'Powered by Calendrian',
                privateExtendedProperty: isAdmin ? undefined : [`visitor_token=${visitorToken || 'default'}`],
                maxResults: 50,
                singleEvents: true,
                timeMin: isAdmin ? undefined : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                orderBy: 'startTime',
            });

            const googleItems = googleResponse.data.items || [];
            formattedGoogleEvents = googleItems.map((item: any) => ({
                id: item.id,
                summary: item.summary,
                description: item.description,
                start: item.start?.dateTime || item.start?.date,
                end: item.end?.dateTime || item.end?.date,
                location: item.location,
                attendeeCount: item.attendees?.length || 0,
                htmlLink: item.htmlLink,
                isScheduled: false
            }));
        }

        // 3. Combine and Sort
        const allEvents = [...formattedScheduled, ...formattedGoogleEvents].sort((a: any, b: any) => {
            const dateA = new Date(a.isScheduled ? a.scheduledFor : a.start);
            const dateB = new Date(b.isScheduled ? b.scheduledFor : b.start);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json({
            success: true,
            events: allEvents
        });

    } catch (error: any) {
        console.error('Error listing events:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
