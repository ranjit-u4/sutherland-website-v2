import Link from "next/link";
import Icon from "./components/Icon";
import SiteNav from "./components/SiteNav";
import "./globals.css";

export const metadata = {
  title: "Incident Log",
  description: "Agent submissions and auditor review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <Icon name="activity" size={15} />
              </span>
              <span className="brand-text">Incident Log</span>
            </Link>
            <SiteNav />
          </div>
        </header>

        <div id="main">{children}</div>
      </body>
    </html>
  );
}
