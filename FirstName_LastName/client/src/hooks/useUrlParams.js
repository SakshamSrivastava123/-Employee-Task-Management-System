import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Keeps list state (search, filters, sort, page) in the URL query string.
 * `keys` is the list of supported params. Changing anything except `page` resets to page 1.
 */
export default function useUrlParams(keys) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(
    () => Object.fromEntries(keys.map((key) => [key, searchParams.get(key) || ''])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  const update = useCallback(
    (patch) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined || value === false) next.delete(key);
          else next.set(key, String(value));
        });
        if (!('page' in patch)) next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  const reset = useCallback(() => setSearchParams({}), [setSearchParams]);

  return [params, update, reset];
}
