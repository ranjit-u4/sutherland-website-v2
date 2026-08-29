"use client";

import { FIELDS } from "@/lib/fields";

/**
 * Renders the editable `entries_v2` fields. Shared by the agent add and modify
 * forms so both stay in sync with lib/fields.js.
 *
 * `readOnlyFields` names fields to show but not allow edits to — the modify
 * form uses it for Agent Name.
 */
export default function EntryFields({
  values,
  onChange,
  disabled = false,
  readOnlyFields = [],
}) {
  return FIELDS.map((field) => {
    const id = `field-${field.name}`;
    const value = values[field.name] ?? "";
    const locked = readOnlyFields.includes(field.name);
    const common = {
      id,
      name: field.name,
      value,
      disabled,
      onChange: (e) => onChange(field.name, e.target.value),
    };

    return (
      <div className="field" key={field.name}>
        <label htmlFor={id}>
          {field.label}
          {field.required ? <span className="required"> *</span> : null}
          {locked ? <span className="muted"> (not editable)</span> : null}
        </label>

        {locked ? (
          // A read-only input rather than a disabled one: the value still reads
          // clearly and is reachable by keyboard, but cannot be changed.
          <input type="text" readOnly value={value} id={id} name={field.name} />
        ) : field.type === "textarea" ? (
          <textarea rows={4} {...common} />
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
            required={field.required || undefined}
            {...common}
          />
        )}
      </div>
    );
  });
}
