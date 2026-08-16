import { useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { submitOrder } from '../services/rooms';
import type { OrderItem } from '../types';

export function OrderComposer({
  roomId,
  user,
  onClose,
}: {
  roomId: string;
  user: User;
  onClose: () => void;
}) {
  const [dish, setDish] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dishRef = useRef<HTMLInputElement>(null);

  const addToCart = () => {
    const d = dish.trim();
    if (!d) {
      dishRef.current?.focus();
      return;
    }
    setCart((prev) => {
      // Se lo stesso piatto è già nel carrello, somma le quantità.
      const idx = prev.findIndex((it) => it.dish === d);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { dish: d, quantity: qty }];
    });
    setDish('');
    setQty(1);
    dishRef.current?.focus();
  };

  const removeItem = (i: number) => setCart((prev) => prev.filter((_, idx) => idx !== i));

  const changeQty = (i: number, delta: number) =>
    setCart((prev) =>
      prev
        .map((it, idx) =>
          idx === i ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it,
        )
        .filter((it) => it.quantity > 0),
    );

  const totalPieces = cart.reduce((s, it) => s + it.quantity, 0);

  const submit = async () => {
    // Include anche il piatto eventualmente digitato ma non ancora aggiunto.
    const pending: OrderItem[] = [...cart];
    if (dish.trim()) pending.push({ dish: dish.trim(), quantity: qty });
    if (pending.length === 0) {
      setError('Aggiungi almeno un piatto.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitOrder(user, roomId, pending);
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet composer" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">Nuovo ordine</h2>
        <p className="sheet-sub">Numero del piatto × quantità. Aggiungine quanti vuoi.</p>

        <div className="composer-row">
          <input
            ref={dishRef}
            className="dish-input"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addToCart()}
            placeholder="N° piatto"
            inputMode="numeric"
            autoFocus
          />
          <div className="qty-stepper">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Meno">
              −
            </button>
            <span className="qty-value">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Più">
              +
            </button>
          </div>
          <button className="btn add-btn" onClick={addToCart}>
            Aggiungi
          </button>
        </div>

        <div className="cart">
          {cart.length === 0 ? (
            <p className="cart-empty">Nessun piatto aggiunto.</p>
          ) : (
            cart.map((it, i) => (
              <div className="cart-item" key={`${it.dish}-${i}`}>
                <span className="cart-dish">Piatto {it.dish}</span>
                <div className="qty-stepper small">
                  <button onClick={() => changeQty(i, -1)} aria-label="Meno">
                    −
                  </button>
                  <span className="qty-value">{it.quantity}</span>
                  <button onClick={() => changeQty(i, 1)} aria-label="Più">
                    +
                  </button>
                </div>
                <button
                  className="cart-remove"
                  onClick={() => removeItem(i)}
                  aria-label="Rimuovi"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="composer-footer">
          <button className="btn ghost" onClick={onClose} disabled={busy}>
            Annulla
          </button>
          <button className="btn primary" onClick={submit} disabled={busy}>
            {busy
              ? 'Invio…'
              : `Invia ordine${totalPieces ? ` (${totalPieces})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
