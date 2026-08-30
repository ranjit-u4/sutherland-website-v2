/**
 * Placeholder shapes for content that is still loading. They occupy roughly the
 * height of the real thing, so nothing jumps when the data lands.
 */

function Bar({ width = "100%", height }) {
  return <span className="skeleton" style={{ width, height }} aria-hidden="true" />;
}

/** Rows shaped like the records table. */
export function TableSkeleton({ rows = 5 }) {
  return (
    <div role="status" aria-label="Loading records">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <Bar width={`${68 - (i % 3) * 12}%`} />
          <Bar width={`${76 - (i % 2) * 14}%`} />
          <Bar width="42%" />
        </div>
      ))}
      <span className="visually-hidden">Loading records…</span>
    </div>
  );
}

/** Label + control pairs, shaped like the entry form. */
export function FormSkeleton({ fields = 5 }) {
  return (
    <div className="panel-body" role="status" aria-label="Loading record">
      {Array.from({ length: fields }, (_, i) => (
        <div className="field" key={i}>
          <Bar width="90px" height="9px" />
          <span style={{ display: "block", height: "8px" }} />
          <Bar height="38px" />
        </div>
      ))}
      <span className="visually-hidden">Loading record…</span>
    </div>
  );
}

/** Label / value pairs, shaped like the read-only record view. */
export function DetailSkeleton({ rows = 6 }) {
  return (
    <div role="status" aria-label="Loading record">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i} style={{ gridTemplateColumns: "170px 1fr" }}>
          <Bar width="70%" height="9px" />
          <Bar width={`${88 - (i % 4) * 16}%`} />
        </div>
      ))}
      <span className="visually-hidden">Loading record…</span>
    </div>
  );
}
