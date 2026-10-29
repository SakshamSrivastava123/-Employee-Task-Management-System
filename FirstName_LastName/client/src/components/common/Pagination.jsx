function buildPages(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap');
    result.push(p);
  });
  return result;
}

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || !pagination.total) return null;
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__summary">
        Showing {from}-{to} of {total}
      </span>
      <div className="pagination__pages">
        <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        {buildPages(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="page-gap">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`page-btn page-btn--num ${p === page ? 'page-btn--active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button type="button" className="page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}
