import { google } from 'googleapis';
import { EventDetails } from '@/types/event-details-type';

/**
 * Creates a Google Calendar event using the provided credentials and details.
 */
export async function createCalendarEvent(
    emails: string[],
    eventDetails: EventDetails,
    refreshToken: string | null | undefined,
    visitorToken: string
) {
    let tokenToUse = refreshToken || process.env.GOOGLE_REFRESH_TOKEN;

    if (tokenToUse === 'null') {
        tokenToUse = process.env.GOOGLE_REFRESH_TOKEN as string;
    }

    if (!tokenToUse || tokenToUse === 'null') {
        throw new Error('No authentication token available.');
    }

    // Initialize OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    // Set credentials
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
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: (refreshToken === 'null' || !refreshToken) ? 'none' : 'all',
    });

    return {
        eventId: response.data.id,
        link: response.data.htmlLink
    };
}
