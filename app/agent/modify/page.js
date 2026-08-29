"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";

export default function ModifyListPage() {
  return (
    <RecordsScreen
      title="Modify a Record"
      lede="Select a record to edit it."
      hrefFor={(record) => `/agent/modify/${record.id}`}
      emptyMessage="No records yet — add one first."
    >
      <Link href="/agent" className="button">
        Back
      </Link>
    </RecordsScreen>
  );
}
