import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { pr, verify, visitorId } = await req.json();

        if (!pr || !verify || !visitorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('payments')
            .insert([
                {
                    invoice: pr,
                    verifyLink: verify,
                    visitorId,
                    masterKey: '',
                    status: 'PENDING'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('Error storing payment:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}


// update the masterkey for the verifyLink in supabase 
export async function PUT(req: NextRequest) {
    try {
        const { verifyLink, masterKey } = await req.json();

        if (!verifyLink || !masterKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('payments')
            .update({
                masterKey: masterKey,
                status: 'PAID'
            })
            .eq('verifyLink', verifyLink)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('Error updating payment:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// check if masterkey exist in the supabase payments list

export async function GET(req: NextRequest) {
    try {
        // extract the masterKey from the request url   
        const url = new URL(req.url);
        const masterKey = url.searchParams.get('masterKey');

        if (!masterKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('masterKey', masterKey);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('Error fetching payment:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
