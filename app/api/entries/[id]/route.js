import {
  PREVIOUS_VALUE_COLUMN,
  UPDATABLE_FIELD_NAMES,
  normalizeFormValues,
  snapshotFields,
  validateRow,
} from "@/lib/fields";
import { getSupabase, ID_COLUMN, jsonError, TABLE } from "@/lib/supabase";

/** GET /api/entries/[id] — read one record. */
export async function GET(request, ctx) {
  const { id } = await ctx.params;

  try {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq(ID_COLUMN, id)
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError("Record not found.", 404);
    return Response.json({ entry: data });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

/**
 * PUT /api/entries/[id] — update a record, keeping one generation of history.
 *
 * Before the new values land, the row's current field values are serialized
 * into `previous_value`. Agent Name and created_at are not editable, so both
 * are left as submitted.
 */
export async function PUT(request, ctx) {
  const { id } = await ctx.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("Request body must be a JSON object.", 400);
  }

  // Only the fields the modify form may change; anything else in the body
  // (agent_name, previous_value, created_at, id) is ignored.
  const present = UPDATABLE_FIELD_NAMES.filter((name) => name in body);
  if (present.length === 0) {
    return jsonError("No updatable fields were provided.", 400);
  }

  const picked = {};
  for (const name of present) picked[name] = body[name];
  const updates = normalizeFormValues(picked);

  const invalid = validateRow(updates);
  if (invalid) return jsonError(invalid, 400);

  try {
    const supabase = getSupabase();

    // Read the row as it stands, so its current values can be preserved.
    const { data: current, error: readError } = await supabase
      .from(TABLE)
      .select("*")
      .eq(ID_COLUMN, id)
      .maybeSingle();

    if (readError) return jsonError(readError.message, 500);
    if (!current) return jsonError("Record not found.", 404);

    updates[PREVIOUS_VALUE_COLUMN] = snapshotFields(current);

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq(ID_COLUMN, id)
      .select()
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError("Record not found.", 404);
    return Response.json({ entry: data });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}
