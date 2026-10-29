import { slug } from '../../utils/format.js';

export function StatusBadge({ status }) {
  return <span className={`badge badge--status-${slug(status)}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge--priority-${slug(priority)}`}>{priority}</span>;
}

export function OverdueBadge() {
  return <span className="badge badge--overdue">Overdue</span>;
}
