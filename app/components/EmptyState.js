import Link from "next/link";
import Icon from "./Icon";

/**
 * Shown in place of a table or panel body when there is genuinely nothing to
 * list — worded so it reads as a state, not as a failure, and carrying the
 * action that would resolve it where there is one.
 */
export default function EmptyState({
  icon = "inbox",
  title = "Nothing here yet",
  message,
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={20} />
      </span>
      <p className="empty-title">{title}</p>
      {message ? <p className="empty-text">{message}</p> : null}
      {action ? (
        <div className="actions">
          <Link className="button primary" href={action.href}>
            {action.icon ? <Icon name={action.icon} size={15} /> : null}
            {action.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
