import type { Order } from '../types';
import { OrderCard } from './OrderCard';
import { PendingRecap } from './PendingRecap';
import { IconPlus } from './Icons';

/** Schermate 1 e 2: elenco completo di ogni ordine da servire. */
export function OrdersFeed({
  orders,
  roomId,
  userId,
  ownerId,
  scope,
  onNewOrder,
}: {
  orders: Order[];
  roomId: string;
  userId: string;
  ownerId: string;
  scope: 'all' | 'mine';
  onNewOrder: () => void;
}) {
  const pieces = orders.reduce(
    (s, o) => s + o.items.reduce((a, it) => a + it.quantity, 0),
    0,
  );

  if (orders.length === 0) {
    return (
      <div className="screen-empty">
        <div className="empty-illustration">🍽️</div>
        <h3>{scope === 'mine' ? 'Nessun tuo ordine' : 'Ancora nessun ordine'}</h3>
        <p>
          {scope === 'mine'
            ? 'I piatti che invii compaiono qui, in attesa di essere serviti.'
            : 'Quando qualcuno invia un ordine lo vedrai qui in tempo reale.'}
        </p>
        <button className="btn primary with-icon" onClick={onNewOrder}>
          <IconPlus width={20} height={20} />
          Crea un ordine
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-summary">
        <div>
          <span className="ss-count num">{orders.length}</span>
          <span className="ss-label">
            {orders.length === 1 ? 'ordine' : 'ordini'} in attesa
          </span>
        </div>
        <div className="ss-pieces num">{pieces} pz totali</div>
      </div>

      <PendingRecap
        orders={orders}
        roomId={roomId}
        userId={userId}
        ownerId={ownerId}
        scope={scope}
      />

      <div className="order-groups">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            roomId={roomId}
            variant="pending"
            canManage={o.createdBy === userId || ownerId === userId}
          />
        ))}
      </div>
    </div>
  );
}
