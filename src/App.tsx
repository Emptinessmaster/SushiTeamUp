import { Navigate, Route, Routes } from 'react-router-dom';
import { isFirebaseConfigured } from './firebase';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import RoomPage from './components/RoomPage';
import SetupNeeded from './components/SetupNeeded';

export default function App() {
  if (!isFirebaseConfigured) {
    return <SetupNeeded />;
  }
  return <AuthedApp />;
}

function AuthedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" aria-label="Caricamento" />
      </div>
    );
  }

  if (!user) {
    // Le rotte pubbliche mostrano comunque il login, ma conservano il codice stanza.
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
