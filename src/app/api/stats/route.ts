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

            if (!paymentError && paymentData) {
                isAdmin = paymentData.view === 'ADMIN';
            }
        }

        const searchParams = req.nextUrl.searchParams;
        const eventId = searchParams.get('eventId');
        let refreshToken = searchParams.get('refreshToken');

        if (!eventId) {
            return NextResponse.json({ error: 'No eventId provided' }, { status: 400 });
        }

        // 1. Check if it's a scheduled event in Supabase first
        const { data: scheduledEvent } = await supabase
            .from('scheduled_events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (scheduledEvent) {
            const stats = {
                total: scheduledEvent.emails.length,
                accepted: { count: 0, emails: [] },
                tentative: { count: 0, emails: [] },
                declined: { count: 0, emails: [] },
                needsAction: {
                    count: scheduledEvent.emails.length,
                    emails: !isAdmin ? scheduledEvent.emails : []
                }
            };
            return NextResponse.json({
                success: true,
                summary: scheduledEvent.event_details.title,
                stats: stats,
                isScheduled: true,
                scheduledStatus: scheduledEvent.status
            });
        }

        // 2. Otherwise, fetch from Google Calendar
        if (refreshToken === 'null' || refreshToken === 'undefined') {
            refreshToken = null;
        }

        const tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        if (!tokenToUse || tokenToUse === 'null') {
            return NextResponse.json({ error: 'No authentication token available.' }, { status: 401 });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ refresh_token: tokenToUse });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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
            stats: stats,
            isScheduled: false
        });

    } catch (error: any) {
        console.error('Error fetching event stats:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
