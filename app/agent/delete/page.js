"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";
import { isNotDeleted } from "@/lib/fields";

export default function DeleteListPage() {
  return (
    <RecordsScreen
      breadcrumbs={[{ label: "Agent", href: "/agent" }, { label: "Delete" }]}
      eyebrow="Delete"
      title="Delete a Record"
      lede="Select a record to delete it. Deleting marks the record as deleted for auditors — it is never removed from the log."
      hrefFor={(record) => `/agent/delete/${record.id}`}
      // Already-deleted records are not offered again.
      filter={isNotDeleted}
      emptyTitle="Nothing to delete"
      emptyMessage="No records are available to delete."
      emptyAction={{ href: "/agent/add", label: "Add a record", icon: "plus" }}
    >
      <Link href="/agent" className="button ghost">
        Back
      </Link>
    </RecordsScreen>
  );
}
