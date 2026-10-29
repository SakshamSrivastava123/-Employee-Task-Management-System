export default function DetailList({ items }) {
  return (
    <dl className="details">
      {items.map(({ label, value }) => (
        <div key={label} className="details__row">
          <dt>{label}</dt>
          <dd>{value || '-'}</dd>
        </div>
      ))}
    </dl>
  );
}
