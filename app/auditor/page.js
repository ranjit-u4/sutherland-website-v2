"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";

export default function AuditorPage() {
  return (
    <RecordsScreen
      title="Auditor"
      lede="Every submitted record. Select a row to review it."
      hrefFor={(record) => `/auditor/${record.id}`}
    >
      <Link href="/" className="button">
        Back to Home
      </Link>
    </RecordsScreen>
  );
}
