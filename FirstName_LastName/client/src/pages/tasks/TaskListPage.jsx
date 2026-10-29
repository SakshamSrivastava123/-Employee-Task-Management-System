import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteTask, exportTasksCsv, fetchTasks, updateTaskStatus } from '../../api/taskApi.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import TaskFilters from '../../components/tasks/TaskFilters.jsx';
import TaskTable from '../../components/tasks/TaskTable.jsx';
import useAsync from '../../hooks/useAsync.js';
import useUrlParams from '../../hooks/useUrlParams.js';
import { PAGE_SIZE } from '../../utils/constants.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

// Everything the list shows lives in the URL: /tasks?status=In%20Progress&priority=High&page=2
const URL_KEYS = ['page', 'search', 'department', 'priority', 'status', 'dueFrom', 'dueTo', 'overdue', 'sortBy', 'order', 'assignedEmployee'];

export default function TaskListPage() {
  const [params, updateParams, resetParams] = useUrlParams(URL_KEYS);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => fetchTasks({ ...params, limit: PAGE_SIZE }),
    [JSON.stringify(params)]
  );

  useEffect(() => {
    const totalPages = data?.pagination?.totalPages;
    if (totalPages && Number(params.page) > totalPages) updateParams({ page: totalPages });
  }, [data, params.page, updateParams]);

  const handleStatusChange = async (task, status) => {
    setBusyId(task.id);
    try {
      await updateTaskStatus(task.id, status);
      notifySuccess(`${task.taskId} moved to ${status}`);
      reload();
    } catch (err) {
      notifyError(err);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(toDelete.id);
      notifySuccess(`${toDelete.taskId} was deleted`);
      setToDelete(null);
      reload();
    } catch (err) {
      notifyError(err);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTasksCsv(params);
      notifySuccess('CSV downloaded with every task that matches your filters');
    } catch (err) {
      notifyError(err);
    } finally {
      setExporting(false);
    }
  };

  const tasks = data?.data || [];

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Assign work, track progress and spot what is overdue"
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <Link to="/tasks/new" className="btn btn--primary">Add task</Link>
          </>
        }
      />
      <TaskFilters params={params} onChange={updateParams} onReset={resetParams} />

      {!data && loading && <Loader label="Loading tasks..." />}
      {error && !data && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className={loading ? 'is-refreshing' : ''}>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks match"
              message="Try different filters, or create a task."
              action={<Link to="/tasks/new" className="btn btn--primary">Add task</Link>}
            />
          ) : (
            <>
              <TaskTable tasks={tasks} busyId={busyId} onStatusChange={handleStatusChange} onDelete={setToDelete} />
              <Pagination pagination={data.pagination} onPageChange={(page) => updateParams({ page })} />
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        loading={deleting}
        title="Delete this task?"
        message={`"${toDelete?.title || ''}" will be permanently removed.`}
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
