"use client";

import { useEffect, useState } from "react";
import RecordsTable from "./RecordsTable";

/**
 * Loads every record and renders the Agent Name / Date of Submission table,
 * with loading and error states. Shared by the agent modify list, the agent
 * records list, and the auditor list.
 *
 * `children` is rendered below the table as the page's action buttons.
 */
export default function RecordsScreen({
  title,
  lede,
  hrefFor,
  emptyMessage = "No records yet.",
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

  return (
    <main className="container">
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}

      {state === "loading" ? <p className="muted">Loading&hellip;</p> : null}
      {state === "error" ? <div className="notice error">{error}</div> : null}

      {state === "ready" && records.length === 0 ? (
        <div className="notice">{emptyMessage}</div>
      ) : null}

      {state === "ready" && records.length > 0 ? (
        <RecordsTable records={records} hrefFor={hrefFor} />
      ) : null}

      <div className="actions">{children}</div>
    </main>
  );
}
