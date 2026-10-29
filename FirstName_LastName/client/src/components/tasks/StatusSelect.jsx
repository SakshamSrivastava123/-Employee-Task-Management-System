import { StatusBadge } from '../common/Badges.jsx';
import { slug } from '../../utils/format.js';

// Offers only the statuses the server says are valid next steps (task.allowedNextStatuses).
export default function StatusSelect({ task, busy, onChange }) {
  if (task.allowedNextStatuses.length === 0) return <StatusBadge status={task.status} />;
  return (
    <select
      className={`status-select status-select--${slug(task.status)}`}
      aria-label={`Change status of ${task.title}`}
      value={task.status}
      disabled={busy}
      onChange={(e) => onChange(task, e.target.value)}
    >
      <option value={task.status}>{task.status}</option>
      {task.allowedNextStatuses.map((s) => (
        <option key={s} value={s}>
          Move to {s}
        </option>
      ))}
    </select>
  );
}
