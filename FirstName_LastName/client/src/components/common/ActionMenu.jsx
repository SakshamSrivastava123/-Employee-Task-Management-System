import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Kebab menu. items: [{ label, to?, onClick?, danger?, disabled?, title? }]
export default function ActionMenu({ items, label = 'Row actions' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button type="button" className="menu__trigger" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">&#8942;</span>
      </button>
      {open && (
        <ul className="menu__list" role="menu">
          {items.map((item) => (
            <li key={item.label} role="none">
              {item.to && !item.disabled ? (
                <Link role="menuitem" className="menu__item" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className={`menu__item ${item.danger ? 'menu__item--danger' : ''}`}
                  disabled={item.disabled}
                  title={item.title}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
