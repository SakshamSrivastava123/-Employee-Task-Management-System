import { Link } from 'react-router-dom';
import ActionMenu from '../common/ActionMenu.jsx';
import { PriorityBadge } from '../common/Badges.jsx';
import DueDate from './DueDate.jsx';
import StatusSelect from './StatusSelect.jsx';

export function EmployeeCell({ employee }) {
  if (employee.deleted) {
    return (
      <div>
        <span>{employee.fullName}</span>
        <div className="muted">{employee.employeeId} &middot; removed employee</div>
      </div>
    );
  }
  return (
    <div>
      <Link to={`/employees/${employee.id}`} className="link-strong">{employee.fullName}</Link>
      <div className="muted">{employee.employeeId}</div>
    </div>
  );
}

export default function TaskTable({ tasks, busyId, onStatusChange, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Assigned to</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due date</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const closed = t.allowedNextStatuses.length === 0;
            return (
              <tr key={t.id} className={t.isOverdue ? 'row--overdue' : ''}>
                <td data-label="Task">
                  <Link to={`/tasks/${t.id}`} className="link-strong">{t.title}</Link>
                  <div className="muted">{t.taskId}</div>
                </td>
                <td data-label="Assigned to"><EmployeeCell employee={t.employee} /></td>
                <td data-label="Department">{t.department}</td>
                <td data-label="Priority"><PriorityBadge priority={t.priority} /></td>
                <td data-label="Status">
                  <StatusSelect task={t} busy={busyId === t.id} onChange={onStatusChange} />
                </td>
                <td data-label="Due date"><DueDate task={t} /></td>
                <td className="table__actions">
                  <ActionMenu
                    items={[
                      { label: 'View', to: `/tasks/${t.id}` },
                      { label: 'Edit', to: `/tasks/${t.id}/edit`, disabled: closed, title: closed ? 'Completed and cancelled tasks cannot be edited' : undefined },
                      { label: 'Delete', danger: true, onClick: () => onDelete(t) },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
