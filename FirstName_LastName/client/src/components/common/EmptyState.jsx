export default function EmptyState({ title, message, action }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}
