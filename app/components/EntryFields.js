"use client";

import { FIELDS } from "@/lib/fields";

/**
 * Renders the editable `entries_v2` fields. Shared by the agent add and modify
 * forms so both stay in sync with lib/fields.js.
 *
 * `readOnlyFields` names fields to show but not allow edits to — the modify
 * form uses it for Agent Name.
 *
 * A field's `maxLength` becomes the input's maxLength attribute and a live
 * character count; the API re-checks the same limit, so this is guidance, not
 * the enforcement.
 */

// Presentation only: which fields share a row on a wide screen. A field not
// named here gets its own full-width row, so adding one to lib/fields.js still
// renders correctly.
const PAIRED_ROWS = [
  ["agent_name", "customer_name"],
  ["severity", "impact"],
  ["cost", "customer_category"],
];

// Short guidance under the fields where the constraint is not self-evident.
const HINTS = {
  agent_name: "Recorded with the submission and not editable afterwards.",
  cost: "Estimated financial impact, in whole or decimal currency units.",
};

/** Group FIELDS into rows according to PAIRED_ROWS, preserving field order. */
function toRows(fields) {
  const rows = [];
  const taken = new Set();

  for (const field of fields) {
    if (taken.has(field.name)) continue;

    const pair = PAIRED_ROWS.find((names) => names.includes(field.name));
    if (!pair) {
      rows.push([field]);
      continue;
    }

    const group = pair
      .map((name) => fields.find((f) => f.name === name))
      .filter(Boolean);
    group.forEach((f) => taken.add(f.name));
    rows.push(group);
  }

  return rows;
}

export default function EntryFields({
  values,
  onChange,
  disabled = false,
  readOnlyFields = [],
}) {
  return toRows(FIELDS).map((row, index) => (
    <div className={`form-row${row.length > 1 ? " field-row" : ""}`} key={index}>
      {row.map((field) => (
        <Field
          disabled={disabled}
          field={field}
          key={field.name}
          locked={readOnlyFields.includes(field.name)}
          onChange={onChange}
          value={values[field.name] ?? ""}
        />
      ))}
    </div>
  ));
}

function Field({ field, value, onChange, disabled, locked }) {
  const id = `field-${field.name}`;
  const hintId = HINTS[field.name] ? `${id}-hint` : undefined;
  const common = {
    id,
    name: field.name,
    value,
    disabled,
    "aria-describedby": hintId,
    onChange: (e) => onChange(field.name, e.target.value),
  };

  const length = String(value).length;
  const nearLimit = field.maxLength && length >= field.maxLength * 0.9;
  const atLimit = field.maxLength && length >= field.maxLength;

  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label}
        {field.required ? (
          <span className="required" aria-hidden="true">
            *
          </span>
        ) : null}
        {locked ? <span className="muted">(not editable)</span> : null}
      </label>

      {locked ? (
        // A read-only input rather than a disabled one: the value still reads
        // clearly and is reachable by keyboard, but cannot be changed.
        <input
          type="text"
          readOnly
          value={value}
          id={id}
          name={field.name}
          aria-describedby={hintId}
        />
      ) : field.type === "textarea" ? (
        <textarea rows={5} maxLength={field.maxLength} {...common} />
      ) : field.type === "select" ? (
        <select {...common}>
          <option value="">&mdash; Select &mdash;</option>
          {field.options.map((opt) => (
            <option value={opt} key={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          step={field.type === "number" ? "any" : undefined}
          maxLength={field.maxLength}
          required={field.required || undefined}
          {...common}
        />
      )}

      {HINTS[field.name] || field.maxLength ? (
        <div className="field-foot">
          {HINTS[field.name] ? (
            <p className="field-hint" id={hintId}>
              {HINTS[field.name]}
            </p>
          ) : null}
          {field.maxLength && !locked ? (
            <span
              className={`char-count${atLimit ? " is-at" : nearLimit ? " is-near" : ""}`}
              aria-live="polite"
            >
              {length.toLocaleString()} / {field.maxLength.toLocaleString()}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
