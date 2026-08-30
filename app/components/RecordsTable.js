"use client";

import { useRouter } from "next/navigation";
import { formatDate, isDeleted } from "@/lib/fields";
import StatusBadges from "./StatusBadges";

/**
 * Agent Name / Date of Submission table over a list of records.
 * Pass `hrefFor` to make the rows clickable; omit it for a plain listing.
 *
 * `showStatus` adds a Status column with the deleted / audit-result badges.
 * The selection tables (modify, delete) leave it off: they already exclude
 * deleted records, and a row there is an action, not a report.
 *
 * Cells carry `data-label` so the table can reflow into stacked cards on a
 * narrow screen without losing its column headings (see globals.css).
 */
export default function RecordsTable({ records, hrefFor, showStatus = false }) {
  const router = useRouter();

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Date of Submission</th>
            {showStatus ? <th>Status</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const href = hrefFor ? hrefFor(record) : null;
            const deleted = isDeleted(record);
            const rowProps = href
              ? {
                  className: "row-link",
                  onClick: () => router.push(href),
                  onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(href);
                    }
                  },
                  tabIndex: 0,
                  role: "link",
                  "aria-label": `Open record from ${record.agent_name ?? "unknown agent"}`,
                }
              : {};

            if (deleted) {
              rowProps.className = [rowProps.className, "row-deleted"]
                .filter(Boolean)
                .join(" ");
            }

            return (
              <tr key={record.id} {...rowProps}>
                <td data-label="Agent Name">{record.agent_name || "—"}</td>
                <td className="date" data-label="Date of Submission">
                  {formatDate(record.created_at)}
                </td>
                {showStatus ? (
                  <td data-label="Status">
                    <StatusBadges record={record} placeholder />
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
