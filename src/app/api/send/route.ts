import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { emails, eventDetails, refreshToken } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
        }

        const tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

        if (!tokenToUse) {
            return NextResponse.json({ error: 'No authentication token available. Please login.' }, { status: 401 });
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
<small><a href="https://calendrian.usebreezee.xyz">Powered by Calendrian</a></small>
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
        };

        // Insert Event
        const response = await calendar.events.insert({
            calendarId: 'primary', // Acts as the user associated with the Refresh Token
            requestBody: event,
            sendUpdates: 'all', // This triggers the email notifications
        });

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
