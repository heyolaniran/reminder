import { EventDetails } from "@/types/event-details-type"

export async function sendReminder(csvData: any[], eventDetails: EventDetails) {

    const refreshToken = localStorage.getItem('google_refresh_token')
    const userEmail = localStorage.getItem('google_user_email')



    const visitorToken = localStorage.getItem('visitor_id')

    const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            emails: csvData,
            eventDetails: eventDetails,
            refreshToken: refreshToken,
            visitorToken: visitorToken
        }),
    })

    if (!response.ok) {
        throw new Error('Failed to send invites')
    }

    const data = await response.json()

    // Track successful send
    if (window.umami) {
        window.umami.track('event_sent', {
            recipients_count: csvData.length,
            organizer_email: userEmail || 'unknown',
            visitor_token: visitorToken
        })
    }

    return data;


}