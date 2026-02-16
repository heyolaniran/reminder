import { NextRequest, NextResponse } from 'next/server';
import { qstash } from '@/lib/qstash';

export const dynamic = 'force-dynamic';

/**
 * Cleanup Trigger Setup: One-time endpoint to register the cleanup schedule in QStash.
 * After creating this file, you can visit /api/cron/cleanup/trigger once to set up the 11 PM daily schedule.
 */
export async function GET(req: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_PROD_BASE_URL || 'http://localhost:3000';
    const cleanupUrl = `${baseUrl}/api/cron/cleanup`;

    try {
        // Create a recurring schedule
        await qstash.schedules.create({
            destination: cleanupUrl,
            cron: "0 23 * * *", // 11 PM daily
        });

        return NextResponse.json({
            success: true,
            message: "Cleanup schedule created successfully for 11 PM daily.",
            destination: cleanupUrl,
            schedule: "0 23 * * *"
        });
    } catch (error: any) {
        console.error("Failed to create cleanup schedule:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            tip: "Ensure QSTASH_TOKEN is set in your environment variables."
        }, { status: 500 });
    }
}
