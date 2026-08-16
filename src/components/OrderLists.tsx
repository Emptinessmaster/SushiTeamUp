import { useMemo, useState } from 'react';
import { deleteOrder, setOrderStatus } from '../services/rooms';
import type { Order } from '../types';
import { Avatar } from './Avatar';

type Scope = 'all' | 'mine';
type Status = 'pending' | 'completed';

export function OrderLists({
  orders,
  roomId,
  userId,
  ownerId,
}: {
  orders: Order[];
  roomId: string;
  userId: string;
  ownerId: string;
}) {
  const [status, setStatus] = useState<Status>('pending');
  const [scope, setScope] = useState<Scope>('all');

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === status && (scope === 'all' || o.createdBy === userId),
      ),
    [orders, status, scope, userId],
  );

  // Conteggi per le etichette dei pulsanti.
  const counts = useMemo(() => {
    const c = { pendingAll: 0, pendingMine: 0, doneAll: 0, doneMine: 0 };
    for (const o of orders) {
      const pieces = o.items.reduce((s, it) => s + it.quantity, 0);
      if (o.status === 'pending') {
        c.pendingAll += pieces;
        if (o.createdBy === userId) c.pendingMine += pieces;
      } else {
        c.doneAll += pieces;
        if (o.createdBy === userId) c.doneMine += pieces;
      }
    }
    return c;
  }, [orders, userId]);

  const listTitle =
    status === 'pending'
      ? scope === 'all'
        ? 'Ordini da fare · Tutti'
        : 'Ordini da fare · Miei'
      : scope === 'all'
        ? 'Ordini effettuati · Tutti'
        : 'Ordini effettuati · Miei';

  return (
    <main className="lists">
      <div className="toggles">
        <div className="segmented">
          <button
            className={status === 'pending' ? 'seg active' : 'seg'}
            onClick={() => setStatus('pending')}
          >
            Da ordinare
          </button>
          <button
            className={status === 'completed' ? 'seg active' : 'seg'}
            onClick={() => setStatus('completed')}
          >
            Effettuati
          </button>
        </div>
        <div className="segmented">
          <button
            className={scope === 'all' ? 'seg active' : 'seg'}
            onClick={() => setScope('all')}
          >
            Tutti (
            {status === 'pending' ? counts.pendingAll : counts.doneAll})
          </button>
          <button
            className={scope === 'mine' ? 'seg active' : 'seg'}
            onClick={() => setScope('mine')}
          >
            Miei (
            {status === 'pending' ? counts.pendingMine : counts.doneMine})
          </button>
        </div>
      </div>

      <h2 className="section-title">{listTitle}</h2>

      {status === 'pending' ? (
        <PendingView
          orders={filtered}
          roomId={roomId}
          userId={userId}
          ownerId={ownerId}
        />
      ) : (
        <CompletedView
          orders={filtered}
          roomId={roomId}
          userId={userId}
          ownerId={ownerId}
        />
      )}
    </main>
  );
}

/** Vista "da ordinare": riepilogo aggregato per piatto + elenco dei giri. */
function PendingView({
  orders,
  roomId,
  userId,
  ownerId,
}: {
  orders: Order[];
  roomId: string;
  userId: string;
  ownerId: string;
}) {
  const summary = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders)
      for (const it of o.items) map.set(it.dish, (map.get(it.dish) ?? 0) + it.quantity);
    return [...map.entries()].sort((a, b) => numericCompare(a[0], b[0]));
  }, [orders]);

  if (orders.length === 0) {
    return <EmptyList text="Nessun ordine in attesa. Tocca “+ Ordine” per iniziare." />;
  }

  return (
    <>
      <div className="summary-card">
        <div className="summary-title">Riepilogo per piatto</div>
        <div className="summary-grid">
          {summary.map(([dish, qty]) => (
            <div className="summary-chip" key={dish}>
              <span className="summary-dish">#{dish}</span>
              <span className="summary-qty">×{qty}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="order-groups">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            roomId={roomId}
            canManage={o.createdBy === userId || ownerId === userId}
            primaryAction="complete"
          />
        ))}
      </div>
    </>
  );
}

/** Vista "effettuati": ogni ordine (giro) mostrato separatamente. */
function CompletedView({
  orders,
  roomId,
  userId,
  ownerId,
}: {
  orders: Order[];
  roomId: string;
  userId: string;
  ownerId: string;
}) {
  if (orders.length === 0) {
    return <EmptyList text="Ancora nessun ordine effettuato." />;
  }
  return (
    <div className="order-groups">
      {orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          roomId={roomId}
          canManage={o.createdBy === userId || ownerId === userId}
          primaryAction="reopen"
        />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  roomId,
  canManage,
  primaryAction,
}: {
  order: Order;
  roomId: string;
  canManage: boolean;
  primaryAction: 'complete' | 'reopen';
}) {
  const [busy, setBusy] = useState(false);
  const pieces = order.items.reduce((s, it) => s + it.quantity, 0);
  const time = order.createdAt?.toDate?.();

  const doComplete = async () => {
    setBusy(true);
    await setOrderStatus(roomId, order.id, 'completed').finally(() => setBusy(false));
  };
  const doReopen = async () => {
    setBusy(true);
    await setOrderStatus(roomId, order.id, 'pending').finally(() => setBusy(false));
  };
  const doDelete = async () => {
    if (!confirm('Eliminare questo ordine?')) return;
    setBusy(true);
    await deleteOrder(roomId, order.id).finally(() => setBusy(false));
  };

  return (
    <div className={`order-card ${order.status}`}>
      <div className="order-card-head">
        <span className="round-badge">Ordine #{order.roundNumber}</span>
        <div className="order-author">
          <Avatar
            name={order.createdByName}
            photoURL={order.createdByPhoto}
            size={22}
          />
          <span>{order.createdByName}</span>
        </div>
        <span className="order-pieces">{pieces} pz</span>
      </div>

      <ul className="order-items">
        {order.items.map((it, i) => (
          <li key={`${it.dish}-${i}`}>
            <span className="oi-dish">Piatto {it.dish}</span>
            <span className="oi-qty">×{it.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="order-card-foot">
        <span className="order-time">
          {time
            ? time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
        {canManage && (
          <div className="order-card-actions">
            {primaryAction === 'complete' ? (
              <button className="btn tiny primary" onClick={doComplete} disabled={busy}>
                Segna effettuato
              </button>
            ) : (
              <button className="btn tiny ghost" onClick={doReopen} disabled={busy}>
                Riporta a da fare
              </button>
            )}
            <button className="btn tiny danger" onClick={doDelete} disabled={busy}>
              Elimina
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="list-empty">
      <span className="list-empty-emoji">🍣</span>
      <p>{text}</p>
    </div>
  );
}

// Ordina i numeri di piatto numericamente quando possibile, altrimenti alfabeticamente.
function numericCompare(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b);
}
