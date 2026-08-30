"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";
import { isNotDeleted } from "@/lib/fields";

export default function ModifyListPage() {
  return (
    <RecordsScreen
      breadcrumbs={[{ label: "Agent", href: "/agent" }, { label: "Modify" }]}
      eyebrow="Modify"
      title="Modify a Record"
      lede="Select a record to edit it. Its current values are kept as one generation of history."
      hrefFor={(record) => `/agent/modify/${record.id}`}
      // A deleted record is not editable, so it is not offered here.
      filter={isNotDeleted}
      emptyTitle="Nothing to modify"
      emptyMessage="No records are available to edit — add one first."
      emptyAction={{ href: "/agent/add", label: "Add a record", icon: "plus" }}
    >
      <Link href="/agent" className="button ghost">
        Back
      </Link>
    </RecordsScreen>
  );
}
