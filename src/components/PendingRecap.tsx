import { useMemo, useState } from 'react';
import { clearPendingOrders } from '../services/rooms';
import type { Order } from '../types';

/**
 * Riepilogo degli ordini attivi: somma per piatto, copiabile e con
 * evidenziazione al tocco (utile per dettare l'ordine al cameriere).
 */
export function PendingRecap({
  orders,
  roomId,
  userId,
  ownerId,
  scope,
}: {
  orders: Order[];
  roomId: string;
  userId: string;
  ownerId: string;
  scope: 'all' | 'mine';
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [clearing, setClearing] = useState(false);

  const { rows, total } = useMemo(() => {
    const map = new Map<string, number>();
    let tot = 0;
    for (const o of orders)
      for (const it of o.items) {
        map.set(it.dish, (map.get(it.dish) ?? 0) + it.quantity);
        tot += it.quantity;
      }
    const sorted = [...map.entries()].sort((a, b) => numericCompare(a[0], b[0]));
    return { rows: sorted, total: tot };
  }, [orders]);

  const toggle = (dish: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(dish) ? next.delete(dish) : next.add(dish);
      return next;
    });

  const copy = async () => {
    const text = rows.map(([dish, qty]) => `${qty}× Piatto ${dish}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard non disponibile */
    }
  };

  const svuota = async () => {
    const label =
      scope === 'mine'
        ? 'Svuotare tutti i tuoi ordini attivi?'
        : ownerId === userId
          ? 'Svuotare tutti gli ordini attivi della stanza?'
          : 'Svuotare i tuoi ordini attivi? (puoi rimuovere solo i tuoi)';
    if (!confirm(label)) return;
    setClearing(true);
    try {
      await clearPendingOrders(roomId, orders, userId, ownerId);
      setDone(new Set());
    } finally {
      setClearing(false);
    }
  };

  if (rows.length === 0) return null;

  return (
    <section className="recap-card">
      <div className="recap-head">
        <div className="recap-title-block">
          <span className="recap-title">Riepilogo da ordinare</span>
          <span className="recap-meta">
            {total} pz · {rows.length} {rows.length === 1 ? 'piatto' : 'piatti'}
          </span>
        </div>
        <button className="recap-copy" onClick={copy}>
          {copied ? 'Copiato ✓' : 'Copia'}
        </button>
      </div>

      <p className="recap-hint">Tocca un piatto per spuntarlo mentre ordini.</p>

      <div className="recap-grid">
        {rows.map(([dish, qty]) => (
          <button
            key={dish}
            className={done.has(dish) ? 'recap-chip done' : 'recap-chip'}
            onClick={() => toggle(dish)}
          >
            <span className="recap-qty">{qty}×</span>
            <span className="recap-dish">Piatto {dish}</span>
          </button>
        ))}
      </div>

      <button className="recap-clear" onClick={svuota} disabled={clearing}>
        {clearing ? 'Svuoto…' : 'Svuota ordini attivi'}
      </button>
    </section>
  );
}

function numericCompare(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b);
}
