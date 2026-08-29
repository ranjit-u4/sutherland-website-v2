import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Incident Log",
  description: "Agent submissions and auditor review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">
            Incident Log
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
