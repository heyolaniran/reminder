import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCalendarEvent } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
    // Basic protection (optional but recommended)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        // 1. Fetch pending events that are due
        const now = new Date().toISOString();
        const { data: pendingEvents, error: fetchError } = await supabase
            .from('scheduled_events')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', now);

        if (fetchError) {
            console.error('Error fetching scheduled events:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch scheduled events' }, { status: 500 });
        }

        if (!pendingEvents || pendingEvents.length === 0) {
            return NextResponse.json({ message: 'No pending events to process' });
        }

        const results = [];

        // 2. Process each event
        for (const event of pendingEvents) {
            try {
                // Call shared library
                const result = await createCalendarEvent(
                    event.emails,
                    event.event_details,
                    event.refresh_token,
                    event.visitor_token
                );

                // Update status to sent
                await supabase
                    .from('scheduled_events')
                    .update({
                        status: 'sent',
                        event_id: result.eventId, // If we add this column
                        error_message: null
                    })
                    .eq('id', event.id);

                results.push({ id: event.id, status: 'sent' });
            } catch (error: any) {
                console.error(`Error processing scheduled event ${event.id}:`, error);

                // Update status to failed
                await supabase
                    .from('scheduled_events')
                    .update({
                        status: 'failed',
                        error_message: error.message || 'Unknown error'
                    })
                    .eq('id', event.id);

                results.push({ id: event.id, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({
            processed: pendingEvents.length,
            results
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
