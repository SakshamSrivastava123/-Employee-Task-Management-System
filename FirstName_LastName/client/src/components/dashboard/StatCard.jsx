import { Link } from 'react-router-dom';

export default function StatCard({ label, value, note, to, tone }) {
  return (
    <Link to={to} className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
      <span className="stat__note">{note}</span>
    </Link>
  );
}
