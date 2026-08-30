"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import EntryFields from "@/app/components/EntryFields";
import Notice from "@/app/components/Notice";
import PageHeader from "@/app/components/PageHeader";
import PreviousValueField from "@/app/components/PreviousValueField";
import { FormSkeleton } from "@/app/components/Skeleton";
import {
  LOCKED_ON_UPDATE,
  UPDATABLE_FIELD_NAMES,
  entryToForm,
  formatDate,
} from "@/lib/fields";

const CRUMBS = [
  { label: "Agent", href: "/agent" },
  { label: "Modify", href: "/agent/modify" },
];

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
        <PageHeader
          breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
          eyebrow="Modify"
          title="Modify Record"
        />
        <section className="panel">
          <FormSkeleton />
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="container narrow">
        <PageHeader
          breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
          eyebrow="Modify"
          title="Modify Record"
        />
        <Notice tone="error" title="Could not load this record">
          <p>{error}</p>
        </Notice>
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
      <PageHeader
        breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
        eyebrow={`Record #${id}`}
        title="Modify Record"
        lede={`Submitted ${formatDate(record.created_at)}${
          record.modified_on ? ` · last modified ${formatDate(record.modified_on)}` : ""
        }`}
      />

      {error ? (
        <Notice tone="error" title="Could not save your changes">
          <p>{error}</p>
        </Notice>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Incident details</h2>
              <p className="panel-subtitle">
                Agent Name and the submission date cannot be changed
              </p>
            </div>
          </div>
          <div className="panel-body">
            <EntryFields
              values={values}
              onChange={update}
              disabled={saving}
              readOnlyFields={LOCKED_ON_UPDATE}
            />
          </div>
          <div className="panel-foot">
            <p className="foot-note">
              Saving replaces the history below with these values.
            </p>
            <Link href="/agent/modify" className="button ghost">
              Cancel
            </Link>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-body">
            {/* Written by the server on each update — shown here, never edited. */}
            <PreviousValueField value={record.previous_value} />
          </div>
        </section>
      </form>
    </main>
  );
}
