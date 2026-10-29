import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="This page does not exist"
      message="Check the address, or head back to the dashboard."
      action={
        <Link to="/" className="btn btn--primary">
          Go to dashboard
        </Link>
      }
    />
  );
}
