"use client";

import Icon from "./Icon";
import {
  FIELDS,
  displayValue,
  formatDate,
  formatPreviousValue,
  isDeleted,
} from "@/lib/fields";

/**
 * The read-only view of a record, grouped into sections. Shared by the
 * auditor's record view and the agent's delete confirmation, which show the
 * same record the same way.
 *
 * `showAudit` adds the deleted / audit-verdict section — the auditor's view
 * reports on it, the delete page is about creating that state.
 */
export default function RecordDetail({ record, showAudit = false }) {
  const previous = formatPreviousValue(record.previous_value);
  const deleted = isDeleted(record);

  return (
    <div className="record-detail">
      <Group title="Record" icon="file">
        {FIELDS.map((field) => (
          <Row
            key={field.name}
            label={field.label}
            numeric={field.type === "number"}
          >
            {displayValue(record[field.name])}
          </Row>
        ))}
      </Group>

      <Group title="Timestamps" icon="clock">
        <Row label="Date of Submission" numeric>
          {formatDate(record.created_at)}
        </Row>
        <Row label="Last Modified" numeric>
          {record.modified_on ? (
            formatDate(record.modified_on)
          ) : (
            <span className="muted">Never modified</span>
          )}
        </Row>
      </Group>

      {showAudit ? (
        <Group title="Audit" icon="auditor">
          <Row label="Deleted">
            {deleted ? (
              <span className="num">
                {formatDate(record.deleted_at)} by {displayValue(record.deleted_by)}
              </span>
            ) : (
              <span className="muted">Not deleted</span>
            )}
          </Row>
          <Row label="Audit Result">
            {record.audit_result ? (
              displayValue(record.audit_result)
            ) : (
              <span className="muted">Not verified yet</span>
            )}
          </Row>
          {/* A reason only accompanies a Fail. */}
          {record.audit_result === "Fail" ? (
            <Row label="Audit Reason">{displayValue(record.audit_reason)}</Row>
          ) : null}
        </Group>
      ) : null}

      <Group title="History" icon="history">
        <Row label="Previous Value">
          {previous ? (
            <pre className="mono json-block">{previous}</pre>
          ) : (
            <span className="muted">null &mdash; no earlier version</span>
          )}
        </Row>
      </Group>
    </div>
  );
}

function Group({ title, icon, children }) {
  return (
    <section className="record-group">
      <h2 className="record-group-title">
        <Icon name={icon} size={13} />
        {title}
      </h2>
      <dl className="record-view">{children}</dl>
    </section>
  );
}

function Row({ label, numeric = false, children }) {
  return (
    <div className="record-row">
      <dt>{label}</dt>
      <dd className={numeric ? "numeric" : undefined}>{children}</dd>
    </div>
  );
}
