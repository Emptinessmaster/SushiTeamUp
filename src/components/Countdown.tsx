import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';

/** Conto alla rovescia fino alla scadenza della stanza (24h). */
export function Countdown({ expiresAt }: { expiresAt: Timestamp | null }) {
  const target = expiresAt?.toMillis?.() ?? 0;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  if (!target) return <span className="countdown">—</span>;

  const remaining = target - now;
  if (remaining <= 0) return <span className="countdown expired">Scaduta</span>;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <span className="countdown" title="Tempo rimanente">
      <span className="countdown-icon">⏳</span>
      {hours > 0 ? `${hours}h ` : ''}
      {minutes}m
    </span>
  );
}
