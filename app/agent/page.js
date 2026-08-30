import Link from "next/link";
import ActionCard from "@/app/components/ActionCard";
import PageHeader from "@/app/components/PageHeader";

export const metadata = {
  title: "Agent — Incident Log",
  description: "Add a new record, or modify or delete an existing one",
};

export default function AgentPage() {
  return (
    <main className="container">
      <PageHeader
        breadcrumbs={[{ label: "Agent" }]}
        eyebrow="Agent"
        title="What would you like to do?"
        lede="Records you submit stay in the log permanently — deleting one marks it as deleted for auditors rather than removing it."
      />

      <div className="card-grid">
        <ActionCard
          href="/agent/add"
          icon="plus"
          title="Add"
          description="Log a new customer incident. Only Agent Name is required."
          tone="primary"
        />
        <ActionCard
          href="/agent/modify"
          icon="pencil"
          title="Modify"
          description="Edit an existing record. Its previous values are kept as history."
        />
        <ActionCard
          href="/agent/delete"
          icon="trash"
          title="Delete"
          description="Withdraw a record from the active log. Auditors still see it."
          tone="danger"
        />
      </div>

      <div className="actions">
        <Link href="/" className="button ghost">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
