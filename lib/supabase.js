import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY MODULE. Never import this from a Client Component — it reads the
// service role key, which must not reach the browser.

export const TABLE = "entries_v2";

// Primary key column used for read-one / update / delete / single-row export.
// If your table's key is named something else, change it here only.
export const ID_COLUMN = "id";

let client;

/**
 * Lazily create the Supabase client so a missing env var surfaces as a request
 * error rather than crashing the build at import time.
 */
export function getSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Consistent JSON error envelope for the route handlers. */
export function jsonError(message, status = 500, extra) {
  return Response.json({ error: message, ...extra }, { status });
}
