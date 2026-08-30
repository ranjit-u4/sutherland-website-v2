import Breadcrumbs from "./Breadcrumbs";

/**
 * The standard page opening: breadcrumbs, an optional eyebrow, the title, and
 * a supporting line. `actions` renders opposite the title on wide screens, for
 * the one control that belongs beside a heading rather than under the content.
 */
export default function PageHeader({
  title,
  lede,
  eyebrow,
  breadcrumbs,
  actions,
  children,
}) {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <header className={`page-header${actions ? " spread" : ""}`}>
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {lede ? <p className="lede">{lede}</p> : null}
          {children}
        </div>
        {actions ? <div className="header-actions">{actions}</div> : null}
      </header>
    </>
  );
}
