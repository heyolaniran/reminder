import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Cleanup Worker: Deletes sent and failed scheduled events from the database.
 * This worker should be triggered daily at 11 PM.
 */
export async function POST(req: NextRequest) {
    return handleCleanup();
}

export async function GET(req: NextRequest) {
    return handleCleanup();
}

async function handleCleanup() {
    try {
        console.log('Starting cleanup of processed scheduled events...');

        // 1. Delete events that have been successfully sent
        const { count: sentCount, error: sentError } = await supabase
            .from('scheduled_events')
            .delete()
            .eq('status', 'sent');

        if (sentError) {
            console.error('Cleanup Error (sent events):', sentError);
            throw sentError;
        }

        // 2. Delete events that failed (they might contain sensitive email data too)
        // We can keep them for a bit longer if needed, but for privacy, clearing them is safer.
        const { count: failedCount, error: failedError } = await supabase
            .from('scheduled_events')
            .delete()
            .eq('status', 'failed');

        if (failedError) {
            console.error('Cleanup Error (failed events):', failedError);
            throw failedError;
        }

        console.log(`Cleanup complete. Deleted ${sentCount || 0} sent and ${failedCount || 0} failed events.`);

        return NextResponse.json({
            success: true,
            deletedSent: sentCount || 0,
            deletedFailed: failedCount || 0
        });

    } catch (error: any) {
        console.error('Cleanup worker error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
