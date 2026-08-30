import Link from "next/link";
import Icon from "./Icon";

/**
 * A large link card: icon, title, one line of explanation, chevron.
 *
 * `aria-label` is set to the title alone so the card's accessible name stays
 * the action itself ("Add"), not the whole paragraph.
 *
 * `tone` picks the icon treatment: "primary" for the recommended action in a
 * group, "danger" for a destructive one, default otherwise.
 */
export default function ActionCard({ href, icon, title, description, tone }) {
  const toneClass =
    tone === "primary"
      ? " is-primary"
      : tone === "danger"
        ? " is-danger"
        : "";

  return (
    <Link className={`action-card${toneClass}`} href={href} aria-label={title}>
      <span className="action-card-icon">
        <Icon name={icon} size={17} />
      </span>
      <span className="action-card-title">
        {title}
        <Icon name="chevronRight" size={16} />
      </span>
      {description ? (
        <span className="action-card-text">{description}</span>
      ) : null}
    </Link>
  );
}
