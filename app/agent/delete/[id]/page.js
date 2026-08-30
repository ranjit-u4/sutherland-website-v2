"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Notice from "@/app/components/Notice";
import PageHeader from "@/app/components/PageHeader";
import RecordDetail from "@/app/components/RecordDetail";
import { DetailSkeleton } from "@/app/components/Skeleton";
import { formatDate, isDeleted } from "@/lib/fields";

const CRUMBS = [
  { label: "Agent", href: "/agent" },
  { label: "Delete", href: "/agent/delete" },
];

/**
 * Delete confirmation. The record is shown read-only — nothing here edits it —
 * and confirming sends a PATCH that soft-deletes it: the row stays in the
 * table with `deleted_at`, `deleted_by` and `modified_on` stamped, so the
 * auditor views keep showing it, marked as deleted.
 */
export default function DeleteRecordPage({ params }) {
  // In this version of Next.js, `params` is a promise.
  const { id } = use(params);
  const router = useRouter();

  const [record, setRecord] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [deleting, setDeleting] = useState(false);
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

  async function handleConfirm() {
    setError(null);
    setDeleting(true);

    try {
      // The route stamps the timestamps itself; it needs only who is deleting.
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_by: record.agent_name ?? null }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error || `Delete failed (${res.status}).`);
        setDeleting(false);
        return;
      }

      router.push("/agent/records");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (state === "loading") {
    return (
      <main className="container narrow">
        <PageHeader
          breadcrumbs={[...CRUMBS, { label: `#${id}` }]}
          eyebrow="Delete"
          title="Delete Record"
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
          eyebrow="Delete"
          title="Delete Record"
        />
        <Notice tone="error" title="Could not load this record">
          <p>{error}</p>
        </Notice>
        <div className="actions">
          <Link href="/agent/delete" className="button">
            Back to records
          </Link>
        </div>
      </main>
    );
  }

  const alreadyDeleted = isDeleted(record);

  return (
    <main className="container narrow">
      <PageHeader
        breadcrumbs={[...CRUMBS, { label: `#${record.id ?? id}` }]}
        eyebrow={`Record #${record.id ?? id}`}
        title="Delete Record"
        lede="Review the record below, then confirm."
      />

      {error ? (
        <Notice tone="error" title="Could not delete this record">
          <p>{error}</p>
        </Notice>
      ) : null}

      {alreadyDeleted ? (
        <Notice tone="info" title="Already deleted">
          <p>
            Deleted by {record.deleted_by || "an unknown agent"} on{" "}
            {formatDate(record.deleted_at)}.
          </p>
        </Notice>
      ) : (
        <Notice tone="warning" title="This record stays in the log">
          <p>
            Confirming marks it as deleted for auditors, together with your name
            and the time. It is not removed from the database, and the app has no
            way to undo it.
          </p>
        </Notice>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Record to delete</h2>
            <p className="panel-subtitle">Read-only — nothing here is editable</p>
          </div>
        </div>

        <RecordDetail record={record} />

        <div className="panel-foot">
          <p className="foot-note">
            Submitted {formatDate(record.created_at)}
          </p>
          <Link href="/agent/delete" className="button ghost">
            Cancel
          </Link>
          <button
            type="button"
            className="button danger"
            onClick={handleConfirm}
            disabled={deleting || alreadyDeleted}
          >
            {deleting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Confirm delete"
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
