import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, fetchEmployee, updateEmployee } from '../../api/employeeApi.js';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import EmployeeForm from '../../components/employees/EmployeeForm.jsx';
import useAsync from '../../hooks/useAsync.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const { data: employee, loading, error, reload } = useAsync(
    () => (isEdit ? fetchEmployee(id) : Promise.resolve(null)),
    [id]
  );

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const saved = isEdit ? await updateEmployee(id, payload) : await createEmployee(payload);
      notifySuccess(isEdit ? 'Employee updated' : 'Employee added');
      navigate(`/employees/${saved.id}`);
    } catch (err) {
      notifyError(err);
      setServerErrors(err.fieldErrors || {});
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading employee..." />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/employees" backLabel="Back to employees" />;

  return (
    <>
      <PageHeader title={isEdit ? `Edit ${employee.fullName}` : 'Add employee'} />
      <EmployeeForm
        isEdit={isEdit}
        initialValues={employee || undefined}
        submitting={submitting}
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
      />
    </>
  );
}
