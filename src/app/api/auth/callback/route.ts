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

        // Return an HTML page that saves the token to localStorage and redirects
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <script>
                    localStorage.setItem('google_refresh_token', '${tokens.refresh_token}');
                    window.location.href = '/?connected=true';
                </script>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
