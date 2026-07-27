import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
export const supabase = createClient(window.__SUPABASE_URL__ || "", window.__SUPABASE_ANON_KEY__ || "");
