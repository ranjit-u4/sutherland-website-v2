import Link from "next/link";

export const metadata = {
  title: "Agent — Incident Log",
  description: "Add a new record or modify an existing one",
};

export default function AgentPage() {
  return (
    <main className="container narrow">
      <h1>Agent</h1>
      <p className="lede">What would you like to do?</p>

      <div className="role-picker">
        <Link href="/agent/add" className="button primary large">
          Add
        </Link>
        <Link href="/agent/modify" className="button large">
          Modify
        </Link>
      </div>

      <div className="actions">
        <Link href="/" className="button">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
