import { useEffect, useState } from 'react';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';

// Debounced search box whose value is driven by the URL.
export default function SearchInput({ value, onChange, placeholder }) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, 400);

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (debounced.trim() !== value) onChange(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <input
      type="search"
      className="input input--search"
      value={text}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => setText(e.target.value)}
    />
  );
}
