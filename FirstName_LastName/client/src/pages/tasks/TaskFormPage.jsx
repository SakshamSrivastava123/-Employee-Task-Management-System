import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEmployeeLookup } from '../../api/employeeApi.js';
import { createTask, fetchTask, updateTask } from '../../api/taskApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import useAsync from '../../hooks/useAsync.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const { data: task, loading: taskLoading, error: taskError, reload } = useAsync(
    () => (isEdit ? fetchTask(id) : Promise.resolve(null)),
    [id]
  );
  const { data: lookup, loading: lookupLoading, error: lookupError } = useAsync(fetchEmployeeLookup, []);

  // Make sure the currently assigned employee is selectable even if not in the lookup list.
  const employees = useMemo(() => {
    const list = lookup || [];
    if (task && !task.employee.deleted && !list.some((e) => e.id === task.assignedEmployee)) {
      return [{ id: task.employee.id, employeeId: task.employee.employeeId, fullName: task.employee.fullName }, ...list];
    }
    return list;
  }, [lookup, task]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const saved = isEdit ? await updateTask(id, payload) : await createTask(payload);
      notifySuccess(isEdit ? 'Task updated' : `${saved.taskId} created`);
      navigate(`/tasks/${saved.id}`);
    } catch (err) {
      notifyError(err); // business-rule messages from the backend are shown as-is
      setServerErrors(err.fieldErrors || {});
      setSubmitting(false);
    }
  };

  if (taskLoading || lookupLoading) return <Loader label="Preparing the form..." />;
  if (taskError || lookupError) {
    return <ErrorState error={taskError || lookupError} onRetry={reload} backTo="/tasks" backLabel="Back to tasks" />;
  }
  if (isEdit && task.allowedNextStatuses.length === 0) {
    return (
      <ErrorState
        error={{ message: `${task.status} tasks cannot be edited.` }}
        backTo={`/tasks/${id}`}
        backLabel="Back to task"
      />
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? `Edit ${task.taskId}` : 'Add task'} />
      <TaskForm
        isEdit={isEdit}
        employees={employees}
        initialValues={task ? { ...task, assignedEmployee: task.assignedEmployee } : undefined}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `/tasks/${id}` : '/tasks')}
      />
    </>
  );
}
