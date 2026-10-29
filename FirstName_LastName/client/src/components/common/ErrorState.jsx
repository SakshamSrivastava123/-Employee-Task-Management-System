import { Link } from 'react-router-dom';

export default function ErrorState({ error, onRetry, backTo, backLabel = 'Go back' }) {
  return (
    <div className="state state--error" role="alert">
      <h2>{error?.status === 404 ? 'We could not find that' : 'Could not load this page'}</h2>
      <p>{error?.message || 'Something went wrong.'}</p>
      <div className="state__actions">
        {onRetry && error?.status !== 404 && (
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Try again
          </button>
        )}
        {backTo && (
          <Link to={backTo} className="btn btn--ghost">
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
