import { createHash, timingSafeEqual } from "node:crypto";
import {
  AUDIT_REASON_COLUMN,
  AUDIT_RESULT_COLUMN,
  AUDIT_RESULTS,
} from "@/lib/fields";
import { getSupabase, ID_COLUMN, jsonError, TABLE } from "@/lib/supabase";

// This route is called by an external workflow, not by the browser, so it is
// guarded by a shared secret instead of a session. WORKFLOW_API_KEY is
// server-side only — never rename it to NEXT_PUBLIC_*, which would ship the
// secret to every client bundle.
const API_KEY_HEADER = "x-api-key";

/** Constant-time compare, over digests so unequal lengths are still safe. */
function secretsMatch(provided, expected) {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Returns a Response when the request should be rejected, or null to continue.
 */
function checkApiKey(request) {
  const expected = process.env.WORKFLOW_API_KEY;

  if (!expected) {
    // A missing server-side secret is our misconfiguration, not the caller's.
    return jsonError(
      "Verification API is not configured: WORKFLOW_API_KEY is not set on the server.",
      500,
    );
  }

  const provided = request.headers.get(API_KEY_HEADER);
  if (!provided) {
    return jsonError(`Missing ${API_KEY_HEADER} header.`, 401);
  }

  if (!secretsMatch(provided, expected)) {
    return jsonError(`Invalid ${API_KEY_HEADER}.`, 401);
  }

  return null;
}

/**
 * PATCH /api/entries/[id]/verification — record the external workflow's verdict.
 *
 *   headers: x-api-key: <WORKFLOW_API_KEY>
 *   body:    { "result": "Pass" | "Fail", "reason": "optional text" }
 *
 * Writes `audit_result` and `audit_reason` and returns the updated record.
 * `result` is checked against AUDIT_RESULTS here so a bad value comes back as a
 * plain 400 rather than as a raw Postgres check-constraint error. The record's
 * own fields, its history and its deleted state are all left untouched.
 */
export async function PATCH(request, ctx) {
  const { id } = await ctx.params;

  const denied = checkApiKey(request);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Request body must be a JSON object.", 400);
  }

  const { result, reason } = body;

  if (typeof result !== "string" || !AUDIT_RESULTS.includes(result)) {
    return jsonError(
      `result must be exactly one of: ${AUDIT_RESULTS.join(", ")}. ` +
        `Received ${JSON.stringify(result ?? null)}.`,
      400,
    );
  }

  if (reason !== undefined && reason !== null && typeof reason !== "string") {
    return jsonError("reason must be a string when provided.", 400);
  }

  // reason is optional; a blank one is stored as null rather than "".
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from(TABLE)
      .update({
        [AUDIT_RESULT_COLUMN]: result,
        [AUDIT_REASON_COLUMN]: trimmedReason || null,
      })
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
