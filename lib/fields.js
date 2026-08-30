// Shared field metadata for `entries_v2`.
// Safe to import from Client Components — no secrets here.

// v2 constrains these three to fixed vocabularies; the database has matching
// check constraints (see supabase/schema.sql), so keep the lists in step.
export const SEVERITY_LEVELS = ["High", "Medium", "Low"];
export const IMPACT_LEVELS = ["High", "Medium", "Low"];
export const CUSTOMER_CATEGORIES = ["Basic", "Silver", "Gold", "Platinum"];

// The only two values `audit_result` accepts; the database has a matching check
// constraint, so keep the list in step with supabase/schema.sql.
export const AUDIT_RESULTS = ["Pass", "Fail"];

// Cap on the free-text fields. Enforced twice on purpose: as maxLength on the
// inputs, and again in validateRow() so the API rejects an oversized body even
// when it did not come from our forms.
export const MAX_TEXT_LENGTH = 2000;

// The editable data columns of `entries_v2`, in display order.
// Deliberately excluded: `created_at` (stamped server-side on insert) and
// `previous_value` (written only by the update route, never by a form).
export const FIELDS = [
  { name: "agent_name", label: "Agent Name", type: "text", required: true },
  { name: "customer_name", label: "Customer Name", type: "text" },
  {
    name: "summary",
    label: "Summary",
    type: "text",
    maxLength: MAX_TEXT_LENGTH,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    maxLength: MAX_TEXT_LENGTH,
  },
  {
    name: "severity",
    label: "Severity",
    type: "select",
    options: SEVERITY_LEVELS,
  },
  { name: "impact", label: "Impact", type: "select", options: IMPACT_LEVELS },
  { name: "cost", label: "Cost", type: "number" },
  {
    name: "customer_category",
    label: "Category",
    type: "select",
    options: CUSTOMER_CATEGORIES,
  },
];

export const FIELD_NAMES = FIELDS.map((f) => f.name);

// Agent Name is set once, at submission, and is not editable afterwards, so
// the update route ignores it even if a client sends it.
export const LOCKED_ON_UPDATE = ["agent_name"];
export const UPDATABLE_FIELD_NAMES = FIELD_NAMES.filter(
  (n) => !LOCKED_ON_UPDATE.includes(n),
);

export const PREVIOUS_VALUE_COLUMN = "previous_value";

// Columns written by the server only, never by a form field.
export const MODIFIED_ON_COLUMN = "modified_on";
export const DELETED_AT_COLUMN = "deleted_at";
export const DELETED_BY_COLUMN = "deleted_by";
export const AUDIT_RESULT_COLUMN = "audit_result";
export const AUDIT_REASON_COLUMN = "audit_reason";

/**
 * Records are soft-deleted: the row stays, with `deleted_at` stamped. Anything
 * that offers to change a record must skip these; the read-only views keep
 * showing them, marked as deleted.
 */
export function isDeleted(row) {
  return Boolean(row?.[DELETED_AT_COLUMN]);
}

export function isNotDeleted(row) {
  return !isDeleted(row);
}

/** An empty form object with every editable field blank. */
export function emptyEntry() {
  return Object.fromEntries(FIELD_NAMES.map((n) => [n, ""]));
}

/** Pull just the editable field values out of a database row, for a form. */
export function entryToForm(row = {}) {
  return Object.fromEntries(FIELD_NAMES.map((n) => [n, row[n] ?? ""]));
}

/**
 * Turn raw form strings into values suitable for the database.
 * Blank optional fields become null rather than "" so they read as absent.
 */
export function normalizeFormValues(form) {
  const out = {};
  for (const field of FIELDS) {
    if (!(field.name in form)) continue;

    const raw = form[field.name];
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (value === "" || value === undefined || value === null) {
      out[field.name] = null;
      continue;
    }

    if (field.type === "number") {
      const n = Number(value);
      // Leave an unparseable number as-is so validateRow can report it.
      out[field.name] = Number.isFinite(n) ? n : value;
      continue;
    }

    out[field.name] = value;
  }
  return out;
}

const OPTION_SETS = {
  severity: SEVERITY_LEVELS,
  impact: IMPACT_LEVELS,
  customer_category: CUSTOMER_CATEGORIES,
};

/**
 * Check a normalized row against the v2 vocabularies and the free-text length
 * caps. Returns an error message, or null when the row is acceptable. Only
 * fields actually present are checked, so this works for both a full insert and
 * a partial update — which is why both the POST and PUT routes call it and get
 * the same server-side enforcement the forms hint at with maxLength.
 */
export function validateRow(row) {
  for (const [name, allowed] of Object.entries(OPTION_SETS)) {
    const value = row[name];
    if (value === undefined || value === null) continue;
    if (!allowed.includes(value)) {
      const label = FIELDS.find((f) => f.name === name).label;
      return `${label} must be one of: ${allowed.join(", ")}.`;
    }
  }

  for (const field of FIELDS) {
    if (!field.maxLength) continue;
    const value = row[field.name];
    if (typeof value !== "string") continue;
    if (value.length > field.maxLength) {
      return `${field.label} must be ${field.maxLength} characters or fewer (received ${value.length}).`;
    }
  }

  if (row.cost !== undefined && row.cost !== null && typeof row.cost !== "number") {
    return "Cost must be a number.";
  }

  return null;
}

/**
 * Snapshot a row's current field values, for writing into `previous_value`
 * before an update overwrites them. `previous_value` itself is excluded, so
 * history does not nest into itself on repeated edits.
 */
export function snapshotFields(row = {}) {
  return Object.fromEntries(FIELD_NAMES.map((n) => [n, row[n] ?? null]));
}

/** Format an ISO timestamp for the record tables. */
export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

/** Render `previous_value` for the read-only field. Empty string when null. */
export function formatPreviousValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Display helper for read-only views: show an em dash for missing values. */
export function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
