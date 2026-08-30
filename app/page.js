import ActionCard from "./components/ActionCard";
import Icon from "./components/Icon";

export const metadata = {
  title: "Incident Log",
  description: "Agent submissions and auditor review",
};

export default function Home() {
  return (
    <main className="container">
      <div className="hero">
        <p className="eyebrow">
          <Icon name="activity" size={13} />
          Incident Log
        </p>
        <h1>Record it once. Review it anywhere.</h1>
        <p className="lede">
          Agents log customer incidents with severity, impact and cost. Auditors
          review the full history, including anything since deleted.
        </p>

        <div className="card-grid hero-grid">
          <ActionCard
            href="/agent"
            icon="agent"
            title="I'm an Agent"
            description="Add a record, modify one you submitted, or delete it from the active log."
            tone="primary"
          />
          <ActionCard
            href="/auditor"
            icon="auditor"
            title="I'm an Auditor"
            description="Read every record and its previous version. Nothing is editable here."
          />
        </div>
      </div>
    </main>
  );
}
