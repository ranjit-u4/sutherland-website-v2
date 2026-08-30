"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

// The two top-level sections. Everything else in the app hangs off one of them.
const SECTIONS = [
  { href: "/agent", label: "Agent", icon: "agent" },
  { href: "/auditor", label: "Auditor", icon: "auditor" },
];

/**
 * Primary navigation. The active section is derived from the path, so a nested
 * page (/agent/delete/12) still highlights Agent, and is marked with
 * aria-current="page" as well as with colour.
 */
export default function SiteNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="site-nav" aria-label="Sections">
      {SECTIONS.map((section) => {
        const active =
          pathname === section.href || pathname.startsWith(`${section.href}/`);

        return (
          <Link
            className="nav-link"
            href={section.href}
            key={section.href}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={section.icon} size={15} />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
