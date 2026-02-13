import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCalendarEvent } from '@/lib/google-calendar';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ error: 'No eventId provided' }, { status: 400 });
        }

        // 1. Fetch the event
        const { data: event, error: fetchError } = await supabase
            .from('scheduled_events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (fetchError || !event) {
            console.error('Error fetching event for QStash callback:', fetchError);
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Check if already processed
        if (event.status !== 'pending') {
            return NextResponse.json({ message: 'Event already processed' });
        }

        // 3. Process the event
        try {
            const result = await createCalendarEvent(
                event.emails,
                event.event_details,
                event.refresh_token,
                event.visitor_token
            );

            // 4. Update status to sent
            await supabase
                .from('scheduled_events')
                .update({
                    status: 'sent',
                    event_id: result.eventId,
                    error_message: null
                })
                .eq('id', event.id);

            return NextResponse.json({ success: true, status: 'sent' });
        } catch (error: any) {
            console.error(`Error processing QStash event ${event.id}:`, error);

            // Update status to failed
            await supabase
                .from('scheduled_events')
                .update({
                    status: 'failed',
                    error_message: error.message || 'Unknown error'
                })
                .eq('id', event.id);

            return NextResponse.json({ status: 'failed', error: error.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('QStash callback error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
