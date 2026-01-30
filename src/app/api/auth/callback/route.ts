import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/api/auth/callback'
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);

        return NextResponse.json({
            message: 'Success! Copy these values to your .env.local file',
            GOOGLE_REFRESH_TOKEN: tokens.refresh_token,
            note: 'Also ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
