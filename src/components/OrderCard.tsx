import { useState } from 'react';
import { deleteOrder, setOrderStatus } from '../services/rooms';
import type { Order } from '../types';
import { Avatar } from './Avatar';
import { IconCheck, IconClock, IconEdit, IconTrash, IconUndo } from './Icons';

export function OrderCard({
  order,
  roomId,
  canManage,
  variant,
  onEdit,
}: {
  order: Order;
  roomId: string;
  canManage: boolean;
  variant: 'pending' | 'completed';
  onEdit?: (order: Order) => void;
}) {
  const [busy, setBusy] = useState(false);
  const pieces = order.items.reduce((s, it) => s + it.quantity, 0);
  const time = order.createdAt?.toDate?.();

  const run = (fn: () => Promise<void>) => {
    setBusy(true);
    fn().finally(() => setBusy(false));
  };

  return (
    <article className={`order-card ${variant}`}>
      <div className="order-card-head">
        <span className="round-badge">#{order.roundNumber}</span>
        <div className="order-author">
          <Avatar name={order.createdByName} photoURL={order.createdByPhoto} size={26} />
          <span>{order.createdByName}</span>
        </div>
        <span className="order-pieces">{pieces} pz</span>
      </div>

      <ul className="order-items">
        {order.items.map((it, i) => (
          <li key={`${it.dish}-${i}`}>
            <span className="oi-badge">{it.dish}</span>
            <span className="oi-dish">Piatto {it.dish}</span>
            <span className="oi-qty">× {it.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="order-card-foot">
        <span className="order-time">
          <IconClock width={14} height={14} />
          {time
            ? time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            : '—'}
        </span>
        {canManage && (
          <div className="order-card-actions">
            {variant === 'pending' ? (
              <>
                {onEdit && (
                  <button
                    className="icon-action"
                    onClick={() => onEdit(order)}
                    disabled={busy}
                    aria-label="Modifica ordine"
                  >
                    <IconEdit width={17} height={17} />
                  </button>
                )}
                <button
                  className="btn tiny served with-icon"
                  onClick={() => run(() => setOrderStatus(roomId, order.id, 'completed'))}
                  disabled={busy}
                >
                  <IconCheck width={16} height={16} />
                  Servito
                </button>
              </>
            ) : (
              <button
                className="btn tiny ghost with-icon"
                onClick={() => run(() => setOrderStatus(roomId, order.id, 'pending'))}
                disabled={busy}
              >
                <IconUndo width={16} height={16} />
                Annulla
              </button>
            )}
            <button
              className="icon-action danger"
              onClick={() => {
                if (confirm('Eliminare questo ordine?'))
                  run(() => deleteOrder(roomId, order.id));
              }}
              disabled={busy}
              aria-label="Elimina"
            >
              <IconTrash width={17} height={17} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
