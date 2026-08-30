"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EntryFields from "@/app/components/EntryFields";
import Notice from "@/app/components/Notice";
import PageHeader from "@/app/components/PageHeader";
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
      <PageHeader
        breadcrumbs={[{ label: "Agent", href: "/agent" }, { label: "Add" }]}
        eyebrow="New record"
        title="Add a Record"
        lede="Only Agent Name is required. Leave anything else blank if it does not apply."
      />

      {error ? (
        <Notice tone="error" title="Could not submit this record">
          <p>{error}</p>
        </Notice>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Incident details</h2>
              <p className="panel-subtitle">
                Fields marked * are required
              </p>
            </div>
          </div>
          <div className="panel-body">
            <EntryFields values={values} onChange={update} disabled={saving} />
          </div>
          <div className="panel-foot">
            <p className="foot-note">
              Submitted with a server-side timestamp.
            </p>
            <Link href="/agent" className="button ghost">
              Cancel
            </Link>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                "Submit record"
              )}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-body">
            {/* A new record has no history yet, so this renders empty. */}
            <PreviousValueField value={null} />
          </div>
        </section>
      </form>
    </main>
  );
}
