import SearchInput from '../common/SearchInput.jsx';
import { DEPARTMENTS, PRIORITIES, TASK_SORT_OPTIONS, TASK_STATUSES } from '../../utils/constants.js';

export default function TaskFilters({ params, onChange, onReset }) {
  const sortValue = params.sortBy ? `${params.sortBy}:${params.order || 'desc'}` : 'createdAt:desc';
  const hasFilters = Object.entries(params).some(([key, value]) => key !== 'page' && value);

  return (
    <div className="filters filters--tasks">
      <SearchInput value={params.search} onChange={(search) => onChange({ search })} placeholder="Search task title or employee" />
      <select className="input" aria-label="Department" value={params.department} onChange={(e) => onChange({ department: e.target.value })}>
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <select className="input" aria-label="Priority" value={params.priority} onChange={(e) => onChange({ priority: e.target.value })}>
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <select className="input" aria-label="Status" value={params.status} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="">All statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <label className="filters__date">
        <span>Due from</span>
        <input type="date" className="input" value={params.dueFrom} max={params.dueTo || undefined} onChange={(e) => onChange({ dueFrom: e.target.value })} />
      </label>
      <label className="filters__date">
        <span>Due to</span>
        <input type="date" className="input" value={params.dueTo} min={params.dueFrom || undefined} onChange={(e) => onChange({ dueTo: e.target.value })} />
      </label>
      <label className="check">
        <input type="checkbox" checked={params.overdue === 'true'} onChange={(e) => onChange({ overdue: e.target.checked ? 'true' : '' })} />
        Overdue only
      </label>
      <select
        className="input"
        aria-label="Sort by"
        value={sortValue}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split(':');
          onChange({ sortBy, order });
        }}
      >
        {TASK_SORT_OPTIONS.map((o) => (
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
