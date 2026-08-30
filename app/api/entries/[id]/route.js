import {
  DELETED_AT_COLUMN,
  DELETED_BY_COLUMN,
  MODIFIED_ON_COLUMN,
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
 * into `previous_value`, and `modified_on` is stamped with the server clock.
 * Agent Name and created_at are not editable, so both are left as submitted.
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

    // A deleted record is not offered on /agent/modify; refuse it here too, so
    // a direct URL cannot edit a record that has been withdrawn.
    if (current[DELETED_AT_COLUMN]) {
      return jsonError("Record has been deleted and can no longer be modified.", 409);
    }

    updates[PREVIOUS_VALUE_COLUMN] = snapshotFields(current);

    // Stamped here, on the server, on every update — never taken from the client.
    updates[MODIFIED_ON_COLUMN] = new Date().toISOString();

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

/**
 * PATCH /api/entries/[id] — soft-delete a record.
 *
 * The row is never removed: `deleted_at` and `modified_on` are stamped with the
 * server clock and `deleted_by` records who did it. Body is optional and may
 * carry `{ deleted_by }`; without it the record's own Agent Name is used.
 * `previous_value` is left alone — a delete is not an edit of the field values.
 *
 * The audit verdict has its own route: PATCH /api/entries/[id]/verification.
 */
export async function PATCH(request, ctx) {
  const { id } = await ctx.params;

  // An empty body is fine here, so parse the text rather than calling .json().
  const raw = await request.text();
  let body = {};
  if (raw.trim()) {
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonError("Request body must be valid JSON.", 400);
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Request body must be a JSON object.", 400);
  }

  if (body[DELETED_BY_COLUMN] !== undefined && body[DELETED_BY_COLUMN] !== null) {
    if (typeof body[DELETED_BY_COLUMN] !== "string") {
      return jsonError("deleted_by must be a string.", 400);
    }
  }

  const deletedBy =
    typeof body[DELETED_BY_COLUMN] === "string"
      ? body[DELETED_BY_COLUMN].trim()
      : "";

  try {
    const supabase = getSupabase();

    const { data: current, error: readError } = await supabase
      .from(TABLE)
      .select("*")
      .eq(ID_COLUMN, id)
      .maybeSingle();

    if (readError) return jsonError(readError.message, 500);
    if (!current) return jsonError("Record not found.", 404);
    if (current[DELETED_AT_COLUMN]) {
      return jsonError("Record has already been deleted.", 409);
    }

    const now = new Date().toISOString();
    const updates = {
      [DELETED_AT_COLUMN]: now,
      [DELETED_BY_COLUMN]: deletedBy || current.agent_name || null,
      [MODIFIED_ON_COLUMN]: now,
    };

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
