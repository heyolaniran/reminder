import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCalendarEvent } from '@/lib/google-calendar';
import { qstash } from '@/lib/qstash';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Fetch pending events that are due
        const now = new Date().toISOString();
        console.log("Current time", now);


        // We use a transaction-like approach: select events and mark them as processing
        // so other workers (if any) don't pick them up.
        const { data: pendingEvents, error: fetchError } = await supabase
            .from('scheduled_events')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', now)
            .limit(10); // Process in batches

        console.log("Events due to be processed:", pendingEvents);

        if (fetchError) {
            console.error('Error fetching scheduled events:', fetchError);
            // Even on error, we schedule the next check
            await scheduleNextRun();
            return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
        }

        if (pendingEvents && pendingEvents.length > 0) {
            console.log(`Worker: Processing ${pendingEvents.length} due events`);

            for (const event of pendingEvents) {
                try {
                    // Update to 'processing' to prevent race conditions
                    await supabase
                        .from('scheduled_events')
                        .update({ status: 'processing' })
                        .eq('id', event.id);

                    console.log(`Processing event ${event.id}: marking as processing`);

                    const result = await createCalendarEvent(
                        event.emails,
                        event.event_details,
                        event.refresh_token,
                        event.visitor_token
                    );

                    console.log(`Successfully sent event ${event.id}. Google Event ID: ${result.eventId}`);

                    await supabase
                        .from('scheduled_events')
                        .update({
                            status: 'sent',
                            error_message: null
                        })
                        .eq('id', event.id);

                } catch (error: any) {
                    console.error(`Worker: Error processing event ${event.id}:`, error);
                    await supabase
                        .from('scheduled_events')
                        .update({
                            status: 'failed',
                            error_message: error.message || 'Unknown error'
                        })
                        .eq('id', event.id);
                }
            }
        }

        // 2. Always schedule the next check in 1 second
        await scheduleNextRun();

        return NextResponse.json({
            success: true,
            processed: pendingEvents?.length || 0
        });

    } catch (error: any) {
        console.error('Worker error:', error);
        // Try to recover by scheduling next run anyway
        await scheduleNextRun().catch(console.error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function scheduleNextRun() {
    const baseUrl = process.env.NEXT_PUBLIC_PROD_BASE_URL || 'http://localhost:3000';
    const workerUrl = `${baseUrl}/api/cron/worker`;

    try {
        await qstash.publishJSON({
            url: workerUrl,
            delay: 1, // 1 second delay
            // We can also add a deduplication key to avoid multiple loops
            deduplicationId: `worker-loop-${Math.floor(Date.now() / 1000)}`
        });
    } catch (e) {
        console.error("Failed to reschedule worker:", e);
    }
}
