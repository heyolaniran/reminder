import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const accessKey = req.headers.get('x-access-key');

        let isAdmin = false;

        if (accessKey) {
            const { data: paymentData, error: paymentError } = await supabase
                .from('payments')
                .select('*')
                .eq('masterKey', accessKey)
                .single();

            if (paymentError || !paymentData) {
                return NextResponse.json({ status: 401, error: 'Unauthorized access' });
            }

            isAdmin = paymentData.view === 'ADMIN' ? true : false;
        }


        /*

        // Direct query to Supabase instead of internal fetch
        const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('masterKey', accessKey);

        if (paymentError || !paymentData || paymentData.length === 0) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }*/


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
                emails: !isAdmin ? attendees.filter((a: any) => a.responseStatus === 'accepted').map((a: any) => a.email) : []
            },
            tentative: {
                count: attendees.filter((a: any) => a.responseStatus === 'tentative').length,
                emails: !isAdmin ? attendees.filter((a: any) => a.responseStatus === 'tentative').map((a: any) => a.email) : []
            },
            declined: {
                count: attendees.filter((a: any) => a.responseStatus === 'declined').length,
                emails: !isAdmin ? attendees.filter((a: any) => a.responseStatus === 'declined').map((a: any) => a.email) : []
            },
            needsAction: {
                count: attendees.filter((a: any) => a.responseStatus === 'needsAction' || !a.responseStatus).length,
                emails: !isAdmin ? attendees.filter((a: any) => a.responseStatus === 'needsAction' || !a.responseStatus).map((a: any) => a.email) : []
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
