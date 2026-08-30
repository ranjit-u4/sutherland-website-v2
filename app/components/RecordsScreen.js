"use client";

import { useEffect, useState } from "react";
import EmptyState from "./EmptyState";
import Notice from "./Notice";
import PageHeader from "./PageHeader";
import RecordsTable from "./RecordsTable";
import { TableSkeleton } from "./Skeleton";

/**
 * Loads every record and renders the Agent Name / Date of Submission table,
 * with loading and error states. Shared by the agent modify list, the agent
 * delete list, the agent records list, and the auditor list.
 *
 * `children` is rendered below the table as the page's action buttons.
 *
 * `filter` narrows what the table shows — the modify and delete lists use it to
 * drop soft-deleted records. `showStatus` adds the deleted / audit badges.
 * `breadcrumbs`, `eyebrow` and `emptyAction` are presentation only.
 */
export default function RecordsScreen({
  title,
  lede,
  eyebrow,
  breadcrumbs,
  hrefFor,
  emptyMessage = "No records yet.",
  emptyTitle = "No records to show",
  emptyAction,
  filter,
  showStatus = false,
  children,
}) {
  const [records, setRecords] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/entries", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!active) return;

        if (!res.ok) {
          setError(payload.error || `Could not load records (${res.status}).`);
          setState("error");
          return;
        }

        setRecords(payload.entries ?? []);
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
  }, []);

  const visible = filter ? records.filter(filter) : records;
  const count = visible.length;

  return (
    <main className="container">
      <PageHeader
        breadcrumbs={breadcrumbs}
        eyebrow={eyebrow}
        title={title}
        lede={lede}
      />

      {state === "error" ? (
        <Notice tone="error" title="Could not load records">
          <p>{error}</p>
        </Notice>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Records</h2>
            <p className="panel-subtitle">
              {state === "loading"
                ? "Loading…"
                : `${count} ${count === 1 ? "record" : "records"}${
                    hrefFor ? " · select a row to continue" : ""
                  }`}
            </p>
          </div>
        </div>

        <div className="panel-body tight">
          {state === "loading" ? <TableSkeleton /> : null}

          {state === "ready" && count === 0 ? (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              action={emptyAction}
            />
          ) : null}

          {state === "ready" && count > 0 ? (
            <RecordsTable
              records={visible}
              hrefFor={hrefFor}
              showStatus={showStatus}
            />
          ) : null}

          {state === "error" ? (
            <EmptyState
              icon="alert"
              title="Nothing to show"
              message="The record list could not be loaded. Try reloading the page."
            />
          ) : null}
        </div>
      </section>

      <div className="actions">{children}</div>
    </main>
  );
}
