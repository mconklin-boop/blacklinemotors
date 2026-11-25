import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { portalConfig } from "./config";

const serverOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

// Full-access client. Server code only; never send this key to a browser.
export function adminClient(): SupabaseClient {
  return createClient(portalConfig.supabaseUrl, portalConfig.serviceRoleKey, serverOptions);
}

// Public-key client used for sign-in and password reset calls.
export function anonClient(): SupabaseClient {
  return createClient(portalConfig.supabaseUrl, portalConfig.supabaseAnonKey, serverOptions);
}
