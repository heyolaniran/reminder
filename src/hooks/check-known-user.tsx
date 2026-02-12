import { supabase } from "@/lib/supabase"

export const checkKnownUserHook = async (visitorId: string) => {

    const { data, error } = await supabase.from('payments').select('*')
        .eq('visitorId', visitorId)
        .eq('status', 'PAID').limit(1);

    if (data && data.length > 0) {
        return true;
    }

    return false;

}