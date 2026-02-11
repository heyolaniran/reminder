import { supabase } from "@/lib/supabase"

export const checkKnownUserHook = async (visitorId: string) => {

    const isKnown = await supabase.from('payments').select('*').eq('visitor_id', visitorId).single();

    if (isKnown.data) {
        return true;
    }

    return false;

}