"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import Notice from "@/app/components/Notice";
import PageHeader from "@/app/components/PageHeader";
import RecordDetail from "@/app/components/RecordDetail";
import { DetailSkeleton } from "@/app/components/Skeleton";
import StatusBadges from "@/app/components/StatusBadges";
import { formatDate } from "@/lib/fields";

const CRUMBS = [{ label: "Auditor", href: "/auditor" }];

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
        <PageHeader
          breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
          eyebrow="Review"
          title={`Record #${id}`}
        />
        <section className="panel">
          <DetailSkeleton />
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="container narrow">
        <PageHeader
          breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
          eyebrow="Review"
          title="Record"
        />
        <Notice tone="error" title="Could not load this record">
          <p>{error}</p>
        </Notice>
        <div className="actions">
          <Link href="/auditor" className="button">
            Back to records
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container narrow">
      <PageHeader
        breadcrumbs={[...CRUMBS, { label: `#${record.id ?? id}` }]}
        eyebrow="Review only"
        title={`Record #${record.id ?? id}`}
        lede={`Submitted ${formatDate(record.created_at)} by ${
          record.agent_name || "an unknown agent"
        }. Records cannot be changed here.`}
      >
        {/* Deleted state and audit verdict, in full. */}
        <div className="header-badges">
          <StatusBadges record={record} showReason />
        </div>
      </PageHeader>

      <section className="panel">
        <RecordDetail record={record} showAudit />
      </section>

      <div className="actions">
        <Link href="/auditor" className="button">
          Back to records
        </Link>
        <Link href="/" className="button ghost">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
