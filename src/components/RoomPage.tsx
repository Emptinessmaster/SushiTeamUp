import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isExpired, joinRoom, subscribeOrders, subscribeRoom } from '../services/rooms';
import type { Order, Room } from '../types';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Countdown } from './Countdown';
import { ShareSheet } from './ShareSheet';
import { OrderComposer } from './OrderComposer';
import { OrdersFeed } from './OrdersFeed';
import { CompletedSummary } from './CompletedSummary';
import { BottomNav, type Tab } from './BottomNav';
import { IconBack, IconPlus, IconShare } from './Icons';

const TITLES: Record<Tab, { title: string; sub: string }> = {
  all: { title: 'Tutti gli ordini', sub: 'Da servire · tutti i partecipanti' },
  mine: { title: 'I miei ordini', sub: 'Da servire · solo i tuoi' },
  doneTotal: { title: 'Totale servito', sub: 'Somma di tutti gli ordini serviti' },
  doneMine: { title: 'I miei serviti', sub: 'Somma dei tuoi ordini serviti' },
};

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
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    if (!user || !code) return;
    let active = true;
    joinRoom(user, code).catch((e) => active && setError((e as Error).message));
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
  const uid = user?.uid ?? '';

  const pending = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const completed = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders],
  );
  const pendingMine = useMemo(
    () => pending.filter((o) => o.createdBy === uid),
    [pending, uid],
  );
  const completedMine = useMemo(
    () => completed.filter((o) => o.createdBy === uid),
    [completed, uid],
  );

  const badges: Record<Tab, number> = {
    all: pending.length,
    mine: pendingMine.length,
    doneTotal: completed.length,
    doneMine: completedMine.length,
  };

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
        <div className="empty-state">
          <Logo size={56} />
          <h2>Stanza non disponibile</h2>
          <p>{error || 'La stanza non esiste o è scaduta.'}</p>
          <button className="btn primary" onClick={() => navigate('/')}>
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  if (!room || !user) return null;

  const members = Object.values(room.members ?? {});

  return (
    <div className="page room-page">
      <header className="room-header">
        <button className="hbtn" onClick={() => navigate('/')} aria-label="Indietro">
          <IconBack width={22} height={22} />
        </button>
        <div className="room-title-block">
          <div className="room-title">{room.name}</div>
          <div className="room-subtitle">
            {room.restaurant ? `${room.restaurant} · ` : ''}
            <span className="room-code-inline">{room.id}</span>
          </div>
        </div>
        <button className="hbtn avatar-btn" onClick={() => signOut()} title="Esci">
          <Avatar user={user} size={30} />
        </button>
      </header>

      <div className="room-strip">
        <Countdown expiresAt={room.expiresAt} />
        <div className="members-inline">
          {members.slice(0, 5).map((m) => (
            <span key={m.uid} className="member-dot" title={m.displayName}>
              <Avatar name={m.displayName} photoURL={m.photoURL} size={26} />
            </span>
          ))}
          {members.length > 5 && (
            <span className="member-more">+{members.length - 5}</span>
          )}
        </div>
        <button className="chip-btn" onClick={() => setShowShare(true)}>
          <IconShare width={16} height={16} />
          Invita
        </button>
      </div>

      {expired ? (
        <div className="empty-state">
          <h2>Stanza scaduta</h2>
          <p>Questa stanza ha superato le 24 ore di durata.</p>
          <button className="btn primary" onClick={() => navigate('/')}>
            Torna alla home
          </button>
        </div>
      ) : (
        <>
          <div className="screen-title">
            <h1>{TITLES[tab].title}</h1>
            <p>{TITLES[tab].sub}</p>
          </div>

          <main className="room-scroll">
            {tab === 'all' && (
              <OrdersFeed
                orders={pending}
                roomId={room.id}
                userId={uid}
                ownerId={room.ownerId}
                scope="all"
                onNewOrder={() => setShowComposer(true)}
              />
            )}
            {tab === 'mine' && (
              <OrdersFeed
                orders={pendingMine}
                roomId={room.id}
                userId={uid}
                ownerId={room.ownerId}
                scope="mine"
                onNewOrder={() => setShowComposer(true)}
              />
            )}
            {tab === 'doneTotal' && (
              <CompletedSummary
                orders={completed}
                roomId={room.id}
                userId={uid}
                ownerId={room.ownerId}
                scope="all"
              />
            )}
            {tab === 'doneMine' && (
              <CompletedSummary
                orders={completedMine}
                roomId={room.id}
                userId={uid}
                ownerId={room.ownerId}
                scope="mine"
              />
            )}
          </main>

          <button
            className="fab"
            onClick={() => setShowComposer(true)}
            aria-label="Nuovo ordine"
          >
            <IconPlus width={22} height={22} />
            <span>Nuovo ordine</span>
          </button>

          <BottomNav active={tab} onChange={setTab} badges={badges} />
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
