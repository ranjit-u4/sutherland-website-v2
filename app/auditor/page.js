"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";

export default function AuditorPage() {
  return (
    <RecordsScreen
      breadcrumbs={[{ label: "Auditor" }]}
      eyebrow="Auditor"
      title="Auditor"
      lede="Every submitted record, including deleted ones. Select a row to review it."
      hrefFor={(record) => `/auditor/${record.id}`}
      emptyTitle="No records to review"
      emptyMessage="Records submitted by agents will appear here."
      showStatus
    >
      <Link href="/" className="button ghost">
        Back to Home
      </Link>
    </RecordsScreen>
  );
}
