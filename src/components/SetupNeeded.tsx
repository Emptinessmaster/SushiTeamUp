import { Logo } from './Logo';

/** Mostrata quando le variabili d'ambiente Firebase non sono configurate. */
export default function SetupNeeded() {
  return (
    <div className="login-screen">
      <div className="login-card setup-card">
        <Logo size={64} />
        <h1 className="app-title">SushiTeamUp</h1>
        <p className="login-sub">Manca la configurazione Firebase.</p>
        <ol className="setup-steps">
          <li>
            Crea un progetto su <strong>console.firebase.google.com</strong>.
          </li>
          <li>
            Abilita <strong>Authentication → Google</strong> e crea un database{' '}
            <strong>Firestore</strong>.
          </li>
          <li>
            Copia <code>.env.example</code> in <code>.env</code> e inserisci i
            valori della tua Web App.
          </li>
          <li>
            Riavvia con <code>npm run dev</code>.
          </li>
        </ol>
        <p className="login-foot">
          Tutti i dettagli sono nel file <code>README.md</code>.
        </p>
      </div>
    </div>
  );
}
