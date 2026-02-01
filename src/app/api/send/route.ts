import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { emails, eventDetails, refreshToken, visitorToken } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
        }

        // --- Rate Limiting Logic ---
        // const isUnauthenticated = !refreshToken || refreshToken === 'null';

        // Check if visitor has a master key (paid user)
        const { data: payRecords } = await supabase
            .from('payments')
            .select('masterKey')
            .eq('visitorId', visitorToken)
            .neq('masterKey', '')
            .not('masterKey', 'is', null);

        const isUnknown = !payRecords || payRecords.length === 0;

        // Apply limits for unauthenticated AND unknown users
        if (isUnknown) {
            // 1. Recipient limit (max 100)
            if (emails.length > 100) {
                return NextResponse.json({
                    error: 'Free tier limit reached: Maximum 100 recipients allowed for unauthenticated users. Please subscribe to a plan to remove this limit.'
                }, { status: 403 });
            }

            // 2. Weekly limit (1 upload per week)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // sum the total recipients in a week
            const { data: recentUploads } = await supabase
                .from('records')
                .select('recipients')
                .eq('visitorId', visitorToken)
                .eq('status', 'FREE_UPLOAD')
                .gt('created_at', oneWeekAgo.toISOString());

            const totalRecipients = recentUploads?.reduce((acc, curr) => acc + curr.recipients, 0);

            if (totalRecipients && totalRecipients > 100) {
                return NextResponse.json({
                    error: 'Free tier limit reached: Maximum 100 recipients allowed for unauthenticated users. Please subscribe to a plan to remove this limit.'
                }, { status: 429 });
            }
        }
        // ---------------------------

        let tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        if (tokenToUse === 'null') {
            tokenToUse = process.env.GOOGLE_REFRESH_TOKEN as string;
        }

        if (!tokenToUse || tokenToUse === 'null') {
            return NextResponse.json({ error: 'No authentication token available. Please subscribe to a plan.' }, { status: 401 });
        }

        // Initialize OAuth2 Client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        // Set credentials using the Request Token we generated
        oauth2Client.setCredentials({
            refresh_token: tokenToUse
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Prepare Attendees
        const attendees = emails.map((email: string) => ({ email }));

        // Prepare Event
        const event = {
            summary: eventDetails.title,
            location: eventDetails.location,
            description: `
            <b>${eventDetails.title}</b><br>
            ${eventDetails.description}<br><br>
            <b>⚠️ IMPORTANT:</b> Please tap <b>"Yes"</b> or <b>"Going"</b> on this invitation to ensure you receive the reminder popup on your phone.<br><br>
            📍 ${eventDetails.location || "Online"}<br><br>
            __________________________<br>
            <small><a href="https://calendrian.vercel.app">Powered by Calendrian</a></small>
      `.trim(),
            start: {
                dateTime: new Date(eventDetails.startDate).toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: (eventDetails.endDate && new Date(eventDetails.endDate) > new Date(eventDetails.startDate))
                    ? new Date(eventDetails.endDate).toISOString()
                    : new Date(new Date(eventDetails.startDate).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'UTC',
            },
            attendees: attendees,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
            guestsCanSeeOtherGuests: false,
            guestsCanInviteOthers: true,
            extendedProperties: {
                private: {
                    visitor_token: visitorToken || 'default'
                }
            }
        };

        // Insert Event
        const response = await calendar.events.insert({
            calendarId: 'primary', // Acts as the user associated with the Refresh Token
            requestBody: event,
            sendUpdates: 'all', // This triggers the email notifications
        });

        // If it was a free upload, record it in supabase to enforce the weekly limit
        if (isUnknown) {
            await supabase.from('records').insert([{
                visitorId: visitorToken!,
                status: 'FREE_UPLOAD',
                recipients: emails.length
            }]);
        }

        return NextResponse.json({
            success: true,
            eventId: response.data.id,
            link: response.data.htmlLink
        });

    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
