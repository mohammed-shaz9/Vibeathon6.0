import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = window.__SUPABASE_URL__ || "";
const supabaseAnonKey = window.__SUPABASE_ANON_KEY__ || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
