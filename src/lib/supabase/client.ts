"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client using the public anon key. Used only for direct-to-Storage
// uploads via signed upload URLs (the token authorizes the upload), so large
// files don't pass through the Next.js server / Vercel body limit.
let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase public env vars are not configured");
  }

  browserClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return browserClient;
}
