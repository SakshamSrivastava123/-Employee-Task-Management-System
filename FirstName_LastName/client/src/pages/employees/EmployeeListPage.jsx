import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteEmployee, fetchEmployees } from '../../api/employeeApi.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Loader from '../../components/common/Loader.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import EmployeeFilters from '../../components/employees/EmployeeFilters.jsx';
import EmployeeTable from '../../components/employees/EmployeeTable.jsx';
import useAsync from '../../hooks/useAsync.js';
import useUrlParams from '../../hooks/useUrlParams.js';
import { PAGE_SIZE } from '../../utils/constants.js';
import { notifyError, notifySuccess } from '../../utils/notify.js';

const URL_KEYS = ['page', 'search', 'department', 'status', 'sortBy', 'order'];

export default function EmployeeListPage() {
  const [params, updateParams, resetParams] = useUrlParams(URL_KEYS);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => fetchEmployees({ ...params, limit: PAGE_SIZE }),
    [JSON.stringify(params)]
  );

  // If the current page no longer exists (e.g. after deleting the last row), step back.
  useEffect(() => {
    const totalPages = data?.pagination?.totalPages;
    if (totalPages && Number(params.page) > totalPages) updateParams({ page: totalPages });
  }, [data, params.page, updateParams]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      notifySuccess(`${toDelete.fullName} was deleted`);
      setToDelete(null);
      reload();
    } catch (err) {
      notifyError(err);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const employees = data?.data || [];

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Everyone who can be assigned work"
        actions={<Link to="/employees/new" className="btn btn--primary">Add employee</Link>}
      />
      <EmployeeFilters params={params} onChange={updateParams} onReset={resetParams} />

      {!data && loading && <Loader label="Loading employees..." />}
      {error && !data && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <div className={loading ? 'is-refreshing' : ''}>
          {employees.length === 0 ? (
            <EmptyState
              title="No employees match"
              message="Try a different search or clear the filters, or add a new employee."
              action={<Link to="/employees/new" className="btn btn--primary">Add employee</Link>}
            />
          ) : (
            <>
              <EmployeeTable employees={employees} onDelete={setToDelete} />
              <Pagination pagination={data.pagination} onPageChange={(page) => updateParams({ page })} />
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        loading={deleting}
        title="Delete this employee?"
        message={`${toDelete?.fullName || ''} will be removed. Their finished tasks stay in the task list with their details.`}
        confirmLabel="Delete employee"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
