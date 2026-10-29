import { Link } from 'react-router-dom';
import { fetchDashboard } from '../../api/dashboardApi.js';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../../components/common/Badges.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SlotMeter from '../../components/common/SlotMeter.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import useAsync from '../../hooks/useAsync.js';
import { formatDate } from '../../utils/format.js';

export default function DashboardPage() {
  const { data, loading, error, reload } = useAsync(fetchDashboard, []);

  if (loading && !data) return <Loader label="Loading dashboard..." />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} />;

  const { employees, tasks, openTasksByPriority, openTasksByDepartment, employeeWorkload, overdueTasks } = data;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live numbers from the server"
        actions={<Link to="/tasks/new" className="btn btn--primary">Add task</Link>}
      />

      <div className="stats">
        <StatCard label="Employees" value={employees.total} note={`${employees.active} active, ${employees.onLeave} on leave, ${employees.inactive} inactive`} to="/employees" />
        <StatCard label="Tasks" value={tasks.total} note={`${tasks.completed} completed, ${tasks.cancelled} cancelled`} to="/tasks" />
        <StatCard label="In progress" value={tasks.inProgress} note={`${tasks.todo} more waiting in Todo`} to="/tasks?status=In%20Progress" />
        <StatCard label="Overdue" value={tasks.overdue} tone={tasks.overdue ? 'danger' : undefined} note={`${tasks.dueInNext7Days} more due in the next 7 days`} to="/tasks?overdue=true" />
      </div>

      <div className="dash-grid">
        <section className="card dash-grid__wide">
          <h2>Employee workload</h2>
          <p className="muted">Open tasks (Todo + In Progress) per employee. Each person can hold 3.</p>
          {employeeWorkload.length === 0 ? (
            <p className="muted">Add employees to see their workload.</p>
          ) : (
            <ul className="workload-list">
              {employeeWorkload.map((e) => (
                <li key={e.id}>
                  <div>
                    <Link to={`/employees/${e.id}`} className="link-strong">{e.fullName}</Link>
                    <div className="muted">{e.department} &middot; {e.todo} todo, {e.inProgress} in progress{e.overdue ? `, ${e.overdue} overdue` : ''}</div>
                  </div>
                  <div className="workload-list__meter">
                    <SlotMeter used={e.activeTasks} max={e.capacity} />
                    <span className="muted">{e.availableSlots === 0 ? 'Full' : `${e.availableSlots} free`}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Open tasks by priority</h2>
          <ul className="breakdown">
            {Object.entries(openTasksByPriority).map(([priority, count]) => (
              <li key={priority}>
                <PriorityBadge priority={priority} />
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Open tasks by department</h2>
          <ul className="breakdown">
            {Object.entries(openTasksByDepartment).map(([department, count]) => (
              <li key={department}>
                <span>{department}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card dash-grid__wide">
          <div className="card__head">
            <h2>Most overdue</h2>
            {tasks.overdue > 0 && <Link to="/tasks?overdue=true" className="link-strong">See all {tasks.overdue}</Link>}
          </div>
          {overdueTasks.length === 0 ? (
            <p className="muted">Nothing is overdue. Nice work.</p>
          ) : (
            <ul className="mini-list">
              {overdueTasks.map((t) => (
                <li key={t.id}>
                  <Link to={`/tasks/${t.id}`} className="link-strong">{t.title}</Link>
                  <span className="mini-list__meta">
                    <span className="muted">{t.employee.fullName}</span>
                    <StatusBadge status={t.status} />
                    <OverdueBadge />
                    <span className="muted">Due {formatDate(t.dueDate)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
