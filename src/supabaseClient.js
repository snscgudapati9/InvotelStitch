import { createClient } from "@supabase/supabase-js";

// Browser-safe Supabase client. Never expose a service-role key in frontend code.
const SUPABASE_URL = "https://oirbxzjgsnbnzociqzqq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vv7BpWcPWjyfvITf9oJRFw_MGel_5B4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
