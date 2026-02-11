import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCalendarEvent } from '@/lib/google-calendar';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { emails, eventDetails, refreshToken, visitorToken } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
        }

        // --- Rate Limiting Logic ---
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

        // Handle Scheduling
        if (eventDetails.scheduledAt) {
            const { error: scheduleError } = await supabase
                .from('scheduled_events')
                .insert([{
                    visitor_token: visitorToken,
                    emails,
                    event_details: eventDetails,
                    refresh_token: refreshToken,
                    scheduled_for: eventDetails.scheduledAt,
                    status: 'pending'
                }]);

            if (scheduleError) {
                console.error('Error scheduling event:', scheduleError);
                return NextResponse.json({ error: 'Failed to schedule reminder' }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                scheduled: true
            });
        }

        // Immediate Send
        const result = await createCalendarEvent(emails, eventDetails, refreshToken, visitorToken);

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
            eventId: result.eventId,
            link: result.link
        });

    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
