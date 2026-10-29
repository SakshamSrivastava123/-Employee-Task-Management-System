import { Link } from 'react-router-dom';
import ActionMenu from '../common/ActionMenu.jsx';
import { StatusBadge } from '../common/Badges.jsx';
import { initials } from '../../utils/format.js';
import { MAX_ACTIVE_TASKS } from '../../utils/constants.js';

export default function EmployeeTable({ employees, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Contact</th>
            <th>Department</th>
            <th>Status</th>
            <th>Active tasks</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td data-label="Employee">
                <div className="person">
                  <span className="avatar" aria-hidden="true">{initials(e.fullName)}</span>
                  <div>
                    <Link to={`/employees/${e.id}`} className="link-strong">{e.fullName}</Link>
                    <div className="muted">{e.employeeId} &middot; {e.role}</div>
                  </div>
                </div>
              </td>
              <td data-label="Contact">
                <div>{e.email}</div>
                <div className="muted">{e.phone}</div>
              </td>
              <td data-label="Department">{e.department}</td>
              <td data-label="Status"><StatusBadge status={e.status} /></td>
              <td data-label="Active tasks">
                <span className={e.activeTaskCount >= MAX_ACTIVE_TASKS ? 'load load--full' : 'load'}>
                  {e.activeTaskCount} / {MAX_ACTIVE_TASKS}
                </span>
              </td>
              <td className="table__actions">
                <ActionMenu
                  items={[
                    { label: 'View', to: `/employees/${e.id}` },
                    { label: 'Edit', to: `/employees/${e.id}/edit` },
                    { label: 'Delete', danger: true, onClick: () => onDelete(e) },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
