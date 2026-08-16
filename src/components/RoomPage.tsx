import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  isExpired,
  joinRoom,
  subscribeOrders,
  subscribeRoom,
} from '../services/rooms';
import type { Order, Room } from '../types';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Countdown } from './Countdown';
import { ShareSheet } from './ShareSheet';
import { OrderComposer } from './OrderComposer';
import { OrderLists } from './OrderLists';

export default function RoomPage() {
  const { roomId = '' } = useParams();
  const code = roomId.toUpperCase();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // Iscrivi l'utente alla stanza (se non è già membro) e poi ascolta i dati.
  useEffect(() => {
    if (!user || !code) return;
    let active = true;
    joinRoom(user, code).catch((e) => {
      if (active) setError((e as Error).message);
    });
    const unsubRoom = subscribeRoom(
      code,
      (r) => {
        if (!active) return;
        setRoom(r);
        setNotFound(r === null);
        setLoading(false);
      },
      (e) => active && setError(e.message),
    );
    const unsubOrders = subscribeOrders(
      code,
      (o) => active && setOrders(o),
      (e) => active && setError(e.message),
    );
    return () => {
      active = false;
      unsubRoom();
      unsubOrders();
    };
  }, [user, code]);

  const expired = useMemo(() => isExpired(room), [room]);

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" aria-label="Caricamento" />
      </div>
    );
  }

  if (notFound || (error && !room)) {
    return (
      <div className="page">
        <main className="empty-state">
          <Logo size={56} />
          <h2>Stanza non disponibile</h2>
          <p>{error || 'La stanza non esiste o è scaduta.'}</p>
          <button className="btn primary" onClick={() => navigate('/')}>
            Torna alla home
          </button>
        </main>
      </div>
    );
  }

  if (!room || !user) return null;

  const memberCount = Object.keys(room.members ?? {}).length;

  return (
    <div className="page room-page">
      <header className="app-header room-header">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Indietro">
          ‹
        </button>
        <div className="room-title-block">
          <div className="room-title">{room.name}</div>
          <div className="room-subtitle">
            {room.restaurant ? `${room.restaurant} · ` : ''}
            <span className="room-code-inline">{room.id}</span>
          </div>
        </div>
        <button className="icon-btn user-chip" onClick={() => signOut()} title="Esci">
          <Avatar user={user} size={26} />
        </button>
      </header>

      <div className="room-strip">
        <div className="strip-item">
          <Countdown expiresAt={room.expiresAt} />
        </div>
        <div className="members-inline">
          {Object.values(room.members ?? {})
            .slice(0, 5)
            .map((m) => (
              <span key={m.uid} className="member-dot" title={m.displayName}>
                <Avatar name={m.displayName} photoURL={m.photoURL} size={24} />
              </span>
            ))}
          {memberCount > 5 && <span className="member-more">+{memberCount - 5}</span>}
        </div>
        <button className="btn small share-btn" onClick={() => setShowShare(true)}>
          Invita
        </button>
      </div>

      {expired ? (
        <main className="empty-state">
          <h2>Stanza scaduta</h2>
          <p>Questa stanza ha superato le 24 ore di durata.</p>
          <button className="btn primary" onClick={() => navigate('/')}>
            Torna alla home
          </button>
        </main>
      ) : (
        <>
          <OrderLists orders={orders} roomId={room.id} userId={user.uid} ownerId={room.ownerId} />

          <button
            className="fab"
            onClick={() => setShowComposer(true)}
            aria-label="Nuovo ordine"
          >
            + Ordine
          </button>
        </>
      )}

      {showShare && <ShareSheet room={room} onClose={() => setShowShare(false)} />}
      {showComposer && (
        <OrderComposer
          roomId={room.id}
          user={user}
          onClose={() => setShowComposer(false)}
        />
      )}
    </div>
  );
}
