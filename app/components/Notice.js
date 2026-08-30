import Icon from "./Icon";

const ICONS = {
  error: "alert",
  warning: "alert",
  success: "check",
  info: "info",
};

/**
 * Inline message block. `tone` is one of info | success | warning | error and
 * picks both the tint and the glyph. Errors are announced to assistive tech.
 */
export default function Notice({ tone = "info", title, children }) {
  return (
    <div
      className={`notice ${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="notice-icon">
        <Icon name={ICONS[tone] ?? "info"} size={16} />
      </span>
      <div className="notice-body">
        {title ? <strong>{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}
