import { useState } from 'react';
import type { User } from 'firebase/auth';
import { submitOrder } from '../services/rooms';
import type { OrderItem } from '../types';
import { IconBackspace, IconCheck, IconPlus, IconTrash } from './Icons';

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

  const pressDigit = (d: string) => {
    setError('');
    setDish((prev) => (prev.length >= 4 ? prev : (prev + d).replace(/^0+(?=\d)/, '')));
  };
  const backspace = () => setDish((prev) => prev.slice(0, -1));

  const addToCart = () => {
    const d = dish.trim();
    if (!d) return;
    setCart((prev) => {
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

  const clearAll = () => {
    setCart([]);
    setDish('');
    setQty(1);
    setError('');
  };

  const totalPieces =
    cart.reduce((s, it) => s + it.quantity, 0) + (dish.trim() ? qty : 0);

  const submit = async () => {
    const pending: OrderItem[] = [...cart];
    if (dish.trim()) pending.push({ dish: dish.trim(), quantity: qty });
    if (pending.length === 0) {
      setError('Aggiungi almeno un piatto prima di inviare.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitOrder(user, roomId, pending);
      // Reset totale: il prossimo ordine parte sempre da zero.
      clearAll();
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
        <div className="composer-head">
          <h2 className="sheet-title">Nuovo ordine</h2>
          {cart.length > 0 && (
            <button className="link-btn" onClick={clearAll}>
              Svuota
            </button>
          )}
        </div>

        {/* Carrello del giro corrente */}
        <div className="cart">
          {cart.length === 0 ? (
            <p className="cart-empty">
              Digita il numero del piatto, scegli la quantità e tocca{' '}
              <strong>Aggiungi</strong>.
            </p>
          ) : (
            cart.map((it, i) => (
              <div className="cart-item" key={`${it.dish}-${i}`}>
                <span className="cart-badge">{it.dish}</span>
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
                  <IconTrash width={18} height={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Display piatto + quantità */}
        <div className="pad-display">
          <div className="pad-number">
            <span className="pad-label">Piatto</span>
            <span className={dish ? 'pad-value' : 'pad-value empty'}>
              {dish || '—'}
            </span>
          </div>
          <div className="pad-qty">
            <span className="pad-label">Quantità</span>
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Meno">
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Più">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tastierino */}
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button key={n} className="key" onClick={() => pressDigit(n)}>
              {n}
            </button>
          ))}
          <button className="key key-muted" onClick={backspace} aria-label="Cancella">
            <IconBackspace width={22} height={22} />
          </button>
          <button className="key" onClick={() => pressDigit('0')}>
            0
          </button>
          <button
            className="key key-add"
            onClick={addToCart}
            disabled={!dish}
            aria-label="Aggiungi piatto"
          >
            <IconPlus width={22} height={22} />
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="composer-footer">
          <button className="btn ghost" onClick={onClose} disabled={busy}>
            Annulla
          </button>
          <button className="btn primary with-icon" onClick={submit} disabled={busy}>
            <IconCheck width={20} height={20} />
            {busy ? 'Invio…' : `Invia${totalPieces ? ` · ${totalPieces} pz` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
