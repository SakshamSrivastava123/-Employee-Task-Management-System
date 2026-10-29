import { OverdueBadge } from '../common/Badges.jsx';
import { formatDate } from '../../utils/format.js';

// Due date + overdue flag. `isOverdue` always comes from the backend so every screen agrees.
export default function DueDate({ task }) {
  return (
    <span className={task.isOverdue ? 'due due--overdue' : 'due'}>
      {formatDate(task.dueDate)} {task.isOverdue && <OverdueBadge />}
    </span>
  );
}
