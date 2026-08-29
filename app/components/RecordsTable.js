"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/fields";

/**
 * Agent Name / Date of Submission table over a list of records.
 * Pass `hrefFor` to make the rows clickable; omit it for a plain listing.
 */
export default function RecordsTable({ records, hrefFor }) {
  const router = useRouter();

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Agent Name</th>
          <th>Date of Submission</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => {
          const href = hrefFor ? hrefFor(record) : null;
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

          return (
            <tr key={record.id} {...rowProps}>
              <td>{record.agent_name || "—"}</td>
              <td>{formatDate(record.created_at)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
