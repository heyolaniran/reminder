
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_URI || ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
