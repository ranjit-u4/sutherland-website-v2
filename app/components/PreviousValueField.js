"use client";

import { formatPreviousValue } from "@/lib/fields";

/**
 * The `previous_value` column, read-only. It holds the JSON snapshot the update
 * route writes before overwriting a record, so it is never editable by hand.
 * A new record has none, and the field renders empty.
 */
export default function PreviousValueField({ value }) {
  const text = formatPreviousValue(value);
  const rows = text ? Math.min(12, text.split("\n").length + 1) : 2;

  return (
    <div className="field">
      <label htmlFor="field-previous_value">
        Previous Value
        <span className="muted">(read-only)</span>
      </label>
      <textarea
        id="field-previous_value"
        className="mono"
        rows={rows}
        value={text}
        readOnly
        placeholder="null — no earlier version of this record"
        aria-describedby="field-previous_value-hint"
      />
      <p className="field-hint" id="field-previous_value-hint">
        Written by the server on each update — one generation of history.
      </p>
    </div>
  );
}
