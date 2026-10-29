import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteEmployee, fetchEmployee } from '../../api/employeeApi.js';
import { fetchTasks } from '../../api/taskApi.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import DetailList from '../../components/common/DetailList.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SlotMeter from '../../components/common/SlotMeter.jsx';
import { PriorityBadge, StatusBadge, OverdueBadge } from '../../components/common/Badges.jsx';
import useAsync from '../../hooks/useAsync.js';
import { MAX_ACTIVE_TASKS } from '../../utils/constants.js';
import { formatDate, initials } from '../../utils/format.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

export default function EmployeeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: employee, loading, error, reload } = useAsync(() => fetchEmployee(id), [id]);
  const { data: tasks } = useAsync(() => fetchTasks({ assignedEmployee: id, sortBy: 'dueDate', order: 'asc', limit: 8 }), [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(id);
      notifySuccess('Employee deleted');
      navigate('/employees');
    } catch (err) {
      notifyError(err);
      setConfirmOpen(false);
      setDeleting(false);
    }
  };

  if (loading && !employee) return <Loader label="Loading employee..." />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/employees" backLabel="Back to employees" />;

  const load = employee.activeTaskCount;
  const taskRows = tasks?.data || [];

  return (
    <>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.employeeId} · ${employee.role}`}
        actions={
          <>
            <Link to={`/employees/${id}/edit`} className="btn btn--primary">Edit</Link>
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmOpen(true)}>Delete</button>
          </>
        }
      />

      <div className="view-grid">
        <section className="card profile">
          <span className="avatar avatar--lg" aria-hidden="true">{initials(employee.fullName)}</span>
          <StatusBadge status={employee.status} />
          {employee.status === 'On Leave' && (
            <p className="muted">On leave {formatDate(employee.leaveStart)} to {formatDate(employee.leaveEnd)}</p>
          )}
          <div className="workload">
            <div className="workload__head">
              <span>Active tasks</span>
              <strong>{load} / {MAX_ACTIVE_TASKS}</strong>
            </div>
            <SlotMeter used={load} />
          </div>
          {employee.skills.length > 0 && (
            <div className="chips">
              {employee.skills.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Details</h2>
          <DetailList
            items={[
              { label: 'Email', value: employee.email },
              { label: 'Phone', value: employee.phone },
              { label: 'Department', value: employee.department },
              { label: 'Role', value: employee.role },
              { label: 'Joined', value: formatDate(employee.joiningDate) },
            ]}
          />
        </section>

        <section className="card view-grid__wide">
          <div className="card__head">
            <h2>Open and upcoming tasks</h2>
            <Link to={`/tasks?assignedEmployee=${id}`} className="link-strong">View all tasks</Link>
          </div>
          {!tasks ? (
            <Loader inline label="Loading tasks..." />
          ) : taskRows.length === 0 ? (
            <p className="muted">No tasks assigned yet.</p>
          ) : (
            <ul className="mini-list">
              {taskRows.map((t) => (
                <li key={t.id}>
                  <Link to={`/tasks/${t.id}`} className="link-strong">{t.title}</Link>
                  <span className="mini-list__meta">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    {t.isOverdue && <OverdueBadge />}
                    <span className="muted">Due {formatDate(t.dueDate)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        loading={deleting}
        title="Delete this employee?"
        message="Employees with Todo or In Progress tasks cannot be deleted. Finished tasks keep this employee's details."
        confirmLabel="Delete employee"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
