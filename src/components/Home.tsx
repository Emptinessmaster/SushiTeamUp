import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRoom, joinRoom, subscribeMyRooms } from '../services/rooms';
import type { Room } from '../types';
import { Logo } from './Logo';
import { Avatar } from './Avatar';

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [myRooms, setMyRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeMyRooms(user.uid, setMyRooms);
  }, [user]);

  if (!user) return null;

  const handleCreate = async () => {
    setBusy(true);
    setError('');
    try {
      const code = await createRoom(user, roomName, restaurant);
      navigate(`/room/${code}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setError('');
    try {
      await joinRoom(user, code);
      navigate(`/room/${code}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-brand">
          <Logo size={30} />
          <span>SushiTeamUp</span>
        </div>
        <button className="home-avatar" onClick={() => signOut()} title="Esci">
          <Avatar user={user} size={34} />
        </button>
      </header>

      <main className="home-main">
        <div className="segmented">
          <button
            className={tab === 'create' ? 'seg active' : 'seg'}
            onClick={() => setTab('create')}
          >
            Crea stanza
          </button>
          <button
            className={tab === 'join' ? 'seg active' : 'seg'}
            onClick={() => setTab('join')}
          >
            Entra con codice
          </button>
        </div>

        {tab === 'create' ? (
          <section className="card">
            <label className="field">
              <span>Nome della serata</span>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Es. Cena di sabato"
                maxLength={40}
              />
            </label>
            <label className="field">
              <span>Ristorante (facoltativo)</span>
              <input
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder="Es. Sushi Tokyo"
                maxLength={40}
              />
            </label>
            <button className="btn primary" onClick={handleCreate} disabled={busy}>
              {busy ? 'Creazione…' : 'Crea la stanza'}
            </button>
            <p className="hint">La stanza sarà attiva per 24 ore.</p>
          </section>
        ) : (
          <section className="card">
            <label className="field">
              <span>Codice stanza</span>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Es. K4P7QX"
                autoCapitalize="characters"
                maxLength={6}
                className="code-input"
              />
            </label>
            <button className="btn primary" onClick={handleJoin} disabled={busy}>
              {busy ? 'Accesso…' : 'Entra nella stanza'}
            </button>
          </section>
        )}

        {error && <p className="error-text">{error}</p>}

        {myRooms.length > 0 && (
          <section className="my-rooms">
            <h2 className="section-title">Le tue stanze attive</h2>
            {myRooms.map((r) => (
              <button
                key={r.id}
                className="room-row"
                onClick={() => navigate(`/room/${r.id}`)}
              >
                <div>
                  <div className="room-row-name">{r.name}</div>
                  <div className="room-row-meta">
                    {r.restaurant ? `${r.restaurant} · ` : ''}
                    {Object.keys(r.members ?? {}).length} partecipanti
                  </div>
                </div>
                <span className="room-row-code">{r.id}</span>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
