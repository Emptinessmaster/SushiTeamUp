import { useMemo, useState } from 'react';
import type { Order } from '../types';
import { OrderCard } from './OrderCard';

/** Schermate 3 e 4: somma degli ordini serviti (totale o personale). */
export function CompletedSummary({
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
  const [showDetail, setShowDetail] = useState(false);

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

  if (orders.length === 0) {
    return (
      <div className="screen-empty">
        <div className="empty-illustration">🧾</div>
        <h3>Niente di servito, per ora</h3>
        <p>
          {scope === 'mine'
            ? 'Quando segni un tuo ordine come “Servito”, entra nel conteggio qui.'
            : 'Il riepilogo dei piatti serviti dal gruppo comparirà qui.'}
        </p>
      </div>
    );
  }

  const max = Math.max(...rows.map(([, q]) => q), 1);

  return (
    <div className="screen">
      <div className="total-hero">
        <span className="total-hero-label">
          {scope === 'mine' ? 'I tuoi piatti serviti' : 'Piatti serviti dal gruppo'}
        </span>
        <span className="total-hero-value">{total}</span>
        <span className="total-hero-sub">
          {rows.length} {rows.length === 1 ? 'piatto diverso' : 'piatti diversi'} ·{' '}
          {orders.length} {orders.length === 1 ? 'ordine' : 'ordini'}
        </span>
      </div>

      <div className="sum-list">
        {rows.map(([dish, qty]) => (
          <div className="sum-row" key={dish}>
            <span className="sum-badge">{dish}</span>
            <div className="sum-main">
              <span className="sum-name">Piatto {dish}</span>
              <div className="sum-bar">
                <span
                  className="sum-bar-fill"
                  style={{ width: `${(qty / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="sum-qty">× {qty}</span>
          </div>
        ))}
      </div>

      <button
        className="detail-toggle"
        onClick={() => setShowDetail((v) => !v)}
      >
        {showDetail ? 'Nascondi dettaglio per ordine' : 'Mostra dettaglio per ordine'}
      </button>

      {showDetail && (
        <div className="order-groups detail">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              roomId={roomId}
              variant="completed"
              canManage={o.createdBy === userId || ownerId === userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function numericCompare(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b);
}
