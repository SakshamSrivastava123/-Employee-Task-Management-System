import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTask, fetchTask, updateTaskStatus } from '../../api/taskApi.js';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../../components/common/Badges.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import DetailList from '../../components/common/DetailList.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import DueDate from '../../components/tasks/DueDate.jsx';
import StatusStepper from '../../components/tasks/StatusStepper.jsx';
import useAsync from '../../hooks/useAsync.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

export default function TaskViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: task, loading, error, reload } = useAsync(() => fetchTask(id), [id]);

  const moveTo = async (status) => {
    setBusy(true);
    try {
      await updateTaskStatus(id, status);
      notifySuccess(`Task moved to ${status}`);
      reload();
    } catch (err) {
      notifyError(err);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteTask(id);
      notifySuccess('Task deleted');
      navigate('/tasks');
    } catch (err) {
      notifyError(err);
      setConfirmOpen(false);
      setBusy(false);
    }
  };

  if (loading && !task) return <Loader label="Loading task..." />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/tasks" backLabel="Back to tasks" />;

  const closed = task.allowedNextStatuses.length === 0;
  const { employee } = task;

  return (
    <>
      <PageHeader
        title={task.title}
        subtitle={task.taskId}
        actions={
          <>
            {!closed && <Link to={`/tasks/${id}/edit`} className="btn btn--primary">Edit</Link>}
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmOpen(true)}>Delete</button>
          </>
        }
      />

      {task.isOverdue && (
        <div className="banner banner--danger" role="status">
          This task was due on {formatDate(task.dueDate)} and is still {task.status}.
        </div>
      )}

      <div className="view-grid">
        <section className="card view-grid__wide">
          <div className="badges">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.isOverdue && <OverdueBadge />}
          </div>
          <StatusStepper status={task.status} />
          {!closed && (
            <div className="status-actions">
              <span className="muted">Move this task to:</span>
              {task.allowedNextStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === 'Cancelled' ? 'btn btn--danger-ghost' : 'btn btn--primary'}
                  disabled={busy}
                  onClick={() => moveTo(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <h2>Description</h2>
          <p className="prose">{task.description || 'No description added.'}</p>
        </section>

        <section className="card">
          <h2>Schedule</h2>
          <DetailList
            items={[
              { label: 'Start date', value: formatDate(task.startDate) },
              { label: 'Due date', value: <DueDate task={task} /> },
              { label: 'Created', value: formatDateTime(task.createdAt) },
              { label: 'Completed', value: task.completedDate ? formatDateTime(task.completedDate) : null },
            ]}
          />
        </section>

        <section className="card">
          <h2>Assigned to</h2>
          <DetailList
            items={[
              {
                label: 'Employee',
                value: employee.deleted ? (
                  `${employee.fullName} (removed)`
                ) : (
                  <Link to={`/employees/${employee.id}`} className="link-strong">{employee.fullName}</Link>
                ),
              },
              { label: 'Employee ID', value: employee.employeeId },
              { label: 'Email', value: employee.email },
              { label: 'Department', value: task.department },
            ]}
          />
          {employee.deleted && <p className="muted">This employee has been deleted. Their details are kept for this task's history.</p>}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        danger
        loading={busy}
        title="Delete this task?"
        message="This permanently removes the task."
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
