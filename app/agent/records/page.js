"use client";

import Link from "next/link";
import RecordsScreen from "@/app/components/RecordsScreen";

export default function AgentRecordsPage() {
  return (
    <RecordsScreen
      breadcrumbs={[{ label: "Agent", href: "/agent" }, { label: "Records" }]}
      eyebrow="Agent"
      title="Records"
      lede="Every submitted record, including deleted ones, newest first."
      emptyTitle="No records yet"
      emptyMessage="Records you submit will appear here."
      emptyAction={{ href: "/agent/add", label: "Add a record", icon: "plus" }}
      showStatus
    >
      <Link href="/agent" className="button">
        Back to Agent
      </Link>
      <Link href="/" className="button ghost">
        Back to Home
      </Link>
    </RecordsScreen>
  );
}
