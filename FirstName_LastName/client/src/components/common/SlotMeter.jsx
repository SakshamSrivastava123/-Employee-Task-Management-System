import { MAX_ACTIVE_TASKS } from '../../utils/constants.js';

// Shows used / free task slots as segments (no inline styles needed).
export default function SlotMeter({ used, max = MAX_ACTIVE_TASKS }) {
  return (
    <div className="slots" role="img" aria-label={`${used} of ${max} task slots used`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`slots__seg ${i < used ? (used >= max ? 'slots__seg--full' : 'slots__seg--used') : ''}`} />
      ))}
    </div>
  );
}
