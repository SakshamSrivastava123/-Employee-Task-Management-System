import { useEffect, useState } from 'react';
import FormField from '../common/FormField.jsx';
import { DEPARTMENTS, MAX_ACTIVE_TASKS, PRIORITIES } from '../../utils/constants.js';
import { formatDate } from '../../utils/format.js';
import { validateTask } from '../../utils/validators.js';

const EMPTY = { title: '', description: '', assignedEmployee: '', department: '', priority: 'Medium', startDate: '', dueDate: '' };

const withoutNulls = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? '']));

function optionLabel(e) {
  const parts = [`${e.fullName} (${e.employeeId})`];
  if (e.status === 'On Leave') parts.push('on leave');
  if (e.activeTaskCount !== undefined) parts.push(`${e.activeTaskCount}/${MAX_ACTIVE_TASKS} tasks`);
  return parts.join(' - ');
}

export default function TaskForm({ initialValues, employees, isEdit, submitting, serverErrors, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => withoutNulls({ ...EMPTY, ...initialValues }));
  const [errors, setErrors] = useState({});

  useEffect(() => setErrors(serverErrors || {}), [serverErrors]);

  const change = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const bind = (name) => ({ id: name, value: values[name], onChange: (e) => change(name, e.target.value) });

  const selected = employees.find((e) => e.id === values.assignedEmployee);
  const leaveHint =
    selected?.status === 'On Leave'
      ? `On leave ${formatDate(selected.leaveStart)} to ${formatDate(selected.leaveEnd)}. The start date must be outside this period.`
      : undefined;

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        assignedEmployee: values.assignedEmployee,
        department: values.department,
        priority: values.priority,
        startDate: values.startDate,
        dueDate: values.dueDate,
      });
    }
  };

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form__grid">
        <FormField label="Title" htmlFor="title" required error={errors.title} className="form__wide">
          <input className="input" {...bind('title')} maxLength={120} />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description} className="form__wide">
          <textarea className="input input--area" rows={4} maxLength={1000} {...bind('description')} />
        </FormField>
        <FormField label="Assigned employee" htmlFor="assignedEmployee" required error={errors.assignedEmployee} hint={leaveHint}>
          <select className="input" {...bind('assignedEmployee')}>
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{optionLabel(e)}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Department" htmlFor="department" required error={errors.department}>
          <select className="input" {...bind('department')}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Priority" htmlFor="priority" required error={errors.priority}>
          <select className="input" {...bind('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Start date" htmlFor="startDate" required error={errors.startDate}>
          <input className="input" type="date" {...bind('startDate')} />
        </FormField>
        <FormField label="Due date" htmlFor="dueDate" required error={errors.dueDate}>
          <input className="input" type="date" min={values.startDate || undefined} {...bind('dueDate')} />
        </FormField>
      </div>
      {!isEdit && <p className="muted form__note">New tasks start as Todo. Change the status from the task list or details page.</p>}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
