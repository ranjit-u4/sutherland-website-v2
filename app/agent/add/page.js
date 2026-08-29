"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EntryFields from "@/app/components/EntryFields";
import PreviousValueField from "@/app/components/PreviousValueField";
import { emptyEntry } from "@/lib/fields";

export default function AddRecordPage() {
  const router = useRouter();
  const [values, setValues] = useState(emptyEntry);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!values.agent_name.trim()) {
      setError("Agent Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error || `Submission failed (${res.status}).`);
        setSaving(false);
        return;
      }

      router.push("/agent/records");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <main className="container narrow">
      <h1>Add a Record</h1>
      <p className="lede">
        Only Agent Name is required. Leave anything else blank if it does not
        apply.
      </p>

      {error ? <div className="notice error">{error}</div> : null}

      <form onSubmit={handleSubmit} noValidate>
        <EntryFields values={values} onChange={update} disabled={saving} />

        {/* A new record has no history yet, so this renders empty. */}
        <PreviousValueField value={null} />

        <div className="actions">
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? "Submitting…" : "Submit record"}
          </button>
          <Link href="/agent" className="button">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
