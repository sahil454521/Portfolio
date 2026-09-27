// Live status, from the Node API. One fetch feeds everything that shows it:
// the top bar, the desk's lights, each case's Status line, the status board.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext({ status: null, check: () => Promise.resolve(null) });

export function StatusProvider({ children }) {
  const [status, setStatus] = useState(null);

  // `fresh` asks the server to check again rather than answer from its
  // minute-long cache; the status board's Check again uses it
  const check = useCallback((fresh) =>
    fetch('/api/status' + (fresh ? '?fresh=' + Date.now() : ''))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        const byHost = {};
        (d.sites || []).forEach((x) => { byHost[x.host] = x; });
        const next = { ...d, byHost };
        setStatus(next);
        // the 3D scene is not React; it listens for this
        window.__siteStatus = next;
        dispatchEvent(new CustomEvent('site-status', { detail: next }));
        return next;
      })
      .catch(() => null), // no claim is better than a wrong one
  []);

  useEffect(() => { check(); }, [check]);
  return <Ctx.Provider value={{ status, check }}>{children}</Ctx.Provider>;
}

export const useStatus = () => useContext(Ctx);
