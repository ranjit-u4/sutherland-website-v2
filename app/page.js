import Link from "next/link";

export const metadata = {
  title: "Incident Log",
  description: "Agent submissions and auditor review",
};

export default function Home() {
  return (
    <main className="container narrow">
      <h1>Incident Log</h1>
      <p className="lede">Choose how you want to use the site.</p>

      <div className="role-picker">
        <Link href="/agent" className="button primary large">
          I&apos;m an Agent
        </Link>
        <Link href="/auditor" className="button large">
          I&apos;m an Auditor
        </Link>
      </div>
    </main>
  );
}
