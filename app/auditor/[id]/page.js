"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  FIELDS,
  displayValue,
  formatDate,
  formatPreviousValue,
} from "@/lib/fields";

/**
 * Read-only record view. Auditors review records in v2 — there is deliberately
 * no edit, delete, or export control here.
 */
export default function AuditorRecordPage({ params }) {
  // In this version of Next.js, `params` is a promise.
  const { id } = use(params);

  const [record, setRecord] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
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

        setRecord(payload.entry ?? {});
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
        <h1>Record</h1>
        <div className="notice error">{error}</div>
        <div className="actions">
          <Link href="/auditor" className="button">
            Back to records
          </Link>
        </div>
      </main>
    );
  }

  const previous = formatPreviousValue(record.previous_value);

  return (
    <main className="container narrow">
      <h1>Record #{record.id ?? id}</h1>
      <p className="lede">Review only &mdash; records cannot be changed here.</p>

      <dl className="record-view">
        {FIELDS.map((field) => (
          <div className="record-row" key={field.name}>
            <dt>{field.label}</dt>
            <dd>{displayValue(record[field.name])}</dd>
          </div>
        ))}

        <div className="record-row">
          <dt>Date of Submission</dt>
          <dd>{formatDate(record.created_at)}</dd>
        </div>

        <div className="record-row">
          <dt>Previous Value</dt>
          <dd>
            {previous ? (
              <pre className="mono json-block">{previous}</pre>
            ) : (
              <span className="muted">null &mdash; no earlier version</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="actions">
        <Link href="/auditor" className="button">
          Back to records
        </Link>
        <Link href="/" className="button">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
