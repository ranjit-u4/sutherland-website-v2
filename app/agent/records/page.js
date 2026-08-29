"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";

export default function AgentRecordsPage() {
  return (
    <RecordsScreen title="Records" lede="Every submitted record.">
      <Link href="/" className="button">
        Back to Home
      </Link>
    </RecordsScreen>
  );
}
