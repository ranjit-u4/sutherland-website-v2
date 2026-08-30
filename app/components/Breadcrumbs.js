import Link from "next/link";
import Icon from "./Icon";

/**
 * Compact trail above the page title: `items` is [{ label, href }], and the
 * last entry is rendered as the current page rather than as a link.
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span className="crumb" key={`${item.label}-${index}`}>
            <span className="breadcrumb-sep" aria-hidden="true">
              <Icon name="chevronRight" size={12} />
            </span>
            {last || !item.href ? (
              <span aria-current={last ? "page" : undefined}>{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
