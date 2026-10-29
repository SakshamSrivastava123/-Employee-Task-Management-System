import SearchInput from '../common/SearchInput.jsx';
import { DEPARTMENTS, EMPLOYEE_SORT_OPTIONS, EMPLOYEE_STATUSES } from '../../utils/constants.js';

export default function EmployeeFilters({ params, onChange, onReset }) {
  const sortValue = params.sortBy ? `${params.sortBy}:${params.order || 'desc'}` : 'createdAt:desc';
  const hasFilters = Object.entries(params).some(([key, value]) => key !== 'page' && value);

  return (
    <div className="filters">
      <SearchInput value={params.search} onChange={(search) => onChange({ search })} placeholder="Search name, email or ID" />
      <select className="input" aria-label="Department" value={params.department} onChange={(e) => onChange({ department: e.target.value })}>
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <select className="input" aria-label="Status" value={params.status} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="">All statuses</option>
        {EMPLOYEE_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select
        className="input"
        aria-label="Sort by"
        value={sortValue}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split(':');
          onChange({ sortBy, order });
        }}
      >
        {EMPLOYEE_SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Clear filters
        </button>
      )}
    </div>
  );
}
