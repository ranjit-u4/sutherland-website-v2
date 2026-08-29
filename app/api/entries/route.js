import { FIELD_NAMES, normalizeFormValues, validateRow } from "@/lib/fields";
import { getSupabase, jsonError, TABLE } from "@/lib/supabase";

const MAX_LIMIT = 500;

/** GET /api/entries[?limit=n] — all records, most recent first. */
export async function GET(request) {
  const requested = Number(request.nextUrl.searchParams.get("limit"));
  const limit =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_LIMIT)
      : MAX_LIMIT;

  try {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return jsonError(error.message, 500);
    return Response.json({ entries: data ?? [] });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

/** POST /api/entries — insert one record with a server-generated timestamp. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("Request body must be a JSON object.", 400);
  }

  // Accept only known columns so a client cannot write arbitrary fields.
  const picked = {};
  for (const name of FIELD_NAMES) picked[name] = body[name];
  const row = normalizeFormValues(picked);

  if (!row.agent_name) {
    return jsonError("Agent Name is required.", 400);
  }

  const invalid = validateRow(row);
  if (invalid) return jsonError(invalid, 400);

  // A brand-new record has no earlier version.
  row.previous_value = null;

  // The timestamp is generated here, on the server — never taken from the client.
  row.created_at = new Date().toISOString();

  try {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .insert(row)
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return Response.json({ entry: data }, { status: 201 });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}
