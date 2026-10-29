import { useEffect, useState } from 'react';
import FormField from '../common/FormField.jsx';
import SkillsInput from '../common/SkillsInput.jsx';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants.js';
import { validateEmployee } from '../../utils/validators.js';

const EMPTY = {
  employeeId: '', fullName: '', email: '', phone: '', department: '', role: '',
  joiningDate: '', status: 'Active', skills: [], leaveStart: '', leaveEnd: '',
};

const withoutNulls = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? '']));

function buildPayload(v) {
  const payload = {
    employeeId: v.employeeId.trim(),
    fullName: v.fullName.trim(),
    email: v.email.trim(),
    phone: v.phone.trim(),
    department: v.department,
    role: v.role.trim(),
    joiningDate: v.joiningDate,
    status: v.status,
    skills: v.skills,
  };
  if (v.status === 'On Leave') {
    payload.leaveStart = v.leaveStart;
    payload.leaveEnd = v.leaveEnd;
  }
  return payload;
}

export default function EmployeeForm({ initialValues, isEdit, submitting, serverErrors, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => withoutNulls({ ...EMPTY, ...initialValues }));
  const [errors, setErrors] = useState({});

  useEffect(() => setErrors(serverErrors || {}), [serverErrors]);

  const change = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const bind = (name) => ({ id: name, value: values[name], onChange: (e) => change(name, e.target.value) });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateEmployee(values, { isEdit });
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(buildPayload(values));
  };

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form__grid">
        <FormField label="Employee ID" htmlFor="employeeId" required error={errors.employeeId} hint={isEdit ? 'Cannot be changed' : 'e.g. EMP-001'}>
          <input className="input" {...bind('employeeId')} readOnly={isEdit} />
        </FormField>
        <FormField label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <input className="input" {...bind('fullName')} autoComplete="name" />
        </FormField>
        <FormField label="Email" htmlFor="email" required error={errors.email}>
          <input className="input" type="email" {...bind('email')} autoComplete="email" />
        </FormField>
        <FormField label="Phone" htmlFor="phone" required error={errors.phone}>
          <input className="input" type="tel" {...bind('phone')} autoComplete="tel" />
        </FormField>
        <FormField label="Department" htmlFor="department" required error={errors.department}>
          <select className="input" {...bind('department')}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Role" htmlFor="role" required error={errors.role}>
          <input className="input" {...bind('role')} />
        </FormField>
        <FormField label="Joining date" htmlFor="joiningDate" required error={errors.joiningDate}>
          <input className="input" type="date" {...bind('joiningDate')} />
        </FormField>
        <FormField label="Status" htmlFor="status" required error={errors.status}>
          <select className="input" {...bind('status')}>
            {EMPLOYEE_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormField>

        {values.status === 'On Leave' && (
          <>
            <FormField label="Leave start" htmlFor="leaveStart" required error={errors.leaveStart}>
              <input className="input" type="date" {...bind('leaveStart')} />
            </FormField>
            <FormField label="Leave end" htmlFor="leaveEnd" required error={errors.leaveEnd} hint="Both dates are inclusive">
              <input className="input" type="date" min={values.leaveStart || undefined} {...bind('leaveEnd')} />
            </FormField>
          </>
        )}

        <FormField label="Skills" htmlFor="skills" className="form__wide" error={errors.skills}>
          <SkillsInput id="skills" value={values.skills} onChange={(skills) => change('skills', skills)} />
        </FormField>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add employee'}
        </button>
      </div>
    </form>
  );
}
