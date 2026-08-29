"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import EntryFields from "@/app/components/EntryFields";
import PreviousValueField from "@/app/components/PreviousValueField";
import {
  LOCKED_ON_UPDATE,
  UPDATABLE_FIELD_NAMES,
  entryToForm,
  formatDate,
} from "@/lib/fields";

export default function ModifyRecordPage({ params }) {
  // In this version of Next.js, `params` is a promise.
  const { id } = use(params);
  const router = useRouter();

  const [values, setValues] = useState(null);
  const [record, setRecord] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(`/api/entries/${id}`, { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;

        if (!res.ok) {
          setError(payload.error || `Could not load record (${res.status}).`);
          setState("error");
          return;
        }

        const entry = payload.entry ?? {};
        setRecord(entry);
        setValues(entryToForm(entry));
        setState("ready");
      } catch (err) {
        if (!active) return;
        setError(err.message);
        setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  function update(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Send only the editable fields; the route preserves Agent Name and
      // moves the record's current values into previous_value.
      const body = {};
      for (const name of UPDATABLE_FIELD_NAMES) body[name] = values[name];

      const res = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error || `Save failed (${res.status}).`);
        setSaving(false);
        return;
      }

      router.push("/agent/records");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (state === "loading") {
    return (
      <main className="container narrow">
        <p className="muted">Loading&hellip;</p>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="container narrow">
        <h1>Modify Record</h1>
        <div className="notice error">{error}</div>
        <div className="actions">
          <Link href="/agent/modify" className="button">
            Back to records
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container narrow">
      <h1>Modify Record</h1>
      <p className="lede">
        Record #{id} &middot; submitted {formatDate(record.created_at)}
      </p>

      {error ? <div className="notice error">{error}</div> : null}

      <form onSubmit={handleSubmit} noValidate>
        <EntryFields
          values={values}
          onChange={update}
          disabled={saving}
          readOnlyFields={LOCKED_ON_UPDATE}
        />

        {/* Written by the server on each update — shown here, never edited. */}
        <PreviousValueField value={record.previous_value} />

        <div className="actions">
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href="/agent/modify" className="button">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
