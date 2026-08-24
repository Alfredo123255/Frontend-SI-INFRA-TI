import { STATUS } from "../data/datacenters";
import "./StatusBadge.css";

function StatusBadge({ status, compact = false }) {
  const meta = STATUS[status] ?? STATUS.online;
  return (
    <span
      className={`status-badge ${compact ? "status-badge--compact" : ""}`}
      style={{ color: meta.color, background: meta.bg }}
    >
      <span className="status-badge__dot" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
      {!compact && meta.label}
    </span>
  );
}

export default StatusBadge;
