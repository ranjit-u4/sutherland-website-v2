"use client";

import { formatDate, isDeleted } from "@/lib/fields";

/**
 * The two pieces of record state that live outside the form fields: the soft
 * delete (`deleted_at` / `deleted_by`) and the external workflow's verdict
 * (`audit_result` / `audit_reason`).
 *
 * Shared by the agent records table, the auditor table, and the auditor's
 * record view so a record reads the same everywhere.
 *
 * `showReason` spells the audit reason out in full — the record view wants it;
 * the tables keep rows compact and pass it as a title attribute instead.
 * `placeholder` renders a quiet "Active / Not verified" badge instead of
 * nothing, which keeps a table column from looking broken.
 */
export default function StatusBadges({
  record,
  showReason = false,
  placeholder = false,
}) {
  const deleted = isDeleted(record);
  const result = record?.audit_result;
  const reason = record?.audit_reason;

  if (!deleted && !result) {
    return placeholder ? (
      <div className="badges">
        <span className="badge inactive">Not verified</span>
      </div>
    ) : null;
  }

  return (
    <div className="status-stack">
      {deleted ? (
        <div className="badges">
          <span className="badge deleted">Deleted</span>
          <span className="badge-note">
            by {record.deleted_by || "unknown"} &middot;{" "}
            <span className="num">{formatDate(record.deleted_at)}</span>
          </span>
        </div>
      ) : null}

      {result ? (
        <div className="badges">
          <span
            className={`badge ${result === "Pass" ? "pass" : "fail"}`}
            title={result === "Fail" && reason ? reason : undefined}
          >
            {result}
          </span>
          {/* A reason only means something on a Fail. */}
          {result === "Fail" && reason ? (
            <span className="badge-note" title={reason}>
              {showReason ? reason : truncate(reason)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function truncate(text, limit = 56) {
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat;
}
