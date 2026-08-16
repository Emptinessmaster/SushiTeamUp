# 🍣 SushiTeamUp

Webapp **mobile-first** per ordinare in gruppo dai menu **all-you-can-eat**.
Crea una stanza (valida 24 ore), invita gli amici con un link o un QR code e
tenete traccia degli ordini in tempo reale.

## Funzionalità

- **Login con Google** (Firebase Authentication)
- **Stanze da 24 ore**: ogni stanza scade automaticamente dopo un giorno
- **Invito via link o QR code** condivisibile
- **Ordini rapidi**: accoppia `numero del piatto × quantità` e invia in un tocco
- **4 liste**, sempre sincronizzate tra tutti i partecipanti:
  1. **Ordini complessivi di tutti** (da fare) — con riepilogo aggregato per piatto
  2. **Ordini personali** (da fare)
  3. **Ordini complessivi effettuati** — divisi per singolo ordine (giro)
  4. **Ordini personali effettuati** — divisi per singolo ordine (giro)

Gli ordini effettuati restano **divisi tra ordini**: ogni invio è un “giro”
numerato (Ordine #1, #2, …) mostrato separatamente.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Firebase](https://firebase.google.com/) — Authentication (Google) + Firestore (realtime)
- [qrcode.react](https://github.com/zpao/qrcode.react) per i QR code

## Configurazione (una tantum)

1. Crea un progetto su [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method →** abilita **Google**.
   - In **Authentication → Settings → Authorized domains** aggiungi il dominio
     su cui pubblicherai (es. `localhost` è già presente per lo sviluppo).
3. **Firestore Database → Create database** (modalità produzione va bene).
4. In **Impostazioni progetto → Le tue app**, crea una **Web app** e copia i
   valori di configurazione.
5. Copia `.env.example` in `.env` e incolla i valori:

   ```bash
   cp .env.example .env
   ```

6. Pubblica le regole di sicurezza contenute in `firestore.rules`
   (dalla console Firestore → **Regole**, oppure con la Firebase CLI:
   `firebase deploy --only firestore:rules`).

## Sviluppo

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato (es. `http://localhost:5173`). Per provarla dal
telefono sulla stessa rete, usa l'URL di rete stampato da Vite.

## Build di produzione

```bash
npm run build
npm run preview
```

Il contenuto statico generato in `dist/` può essere pubblicato su Firebase
Hosting, Netlify, Vercel o qualsiasi hosting statico.

> Suggerimento per l'hosting: essendo una **Single Page App** con rotte come
> `/room/ABC123`, configura un fallback che serva `index.html` per tutte le
> rotte (su Firebase Hosting: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`).

## Come si usa

1. Accedi con Google.
2. **Crea una stanza** (dai un nome, opzionalmente il ristorante) oppure
   **entra con il codice**.
3. Tocca **Invita** per mostrare il QR o copiare il link.
4. Tocca **+ Ordine**, inserisci `numero piatto × quantità`, aggiungi altri
   piatti e **Invia ordine**.
5. Usa i due interruttori in alto per passare tra le 4 liste
   (**Da ordinare / Effettuati** × **Tutti / Miei**).
6. Quando il cibo arriva, tocca **Segna effettuato**: l'ordine passa nelle
   liste “effettuati”, sempre diviso per giro.

## Note sulla sicurezza

Le chiavi Firebase lato Web (in `.env`) **non sono segrete**: identificano il
progetto. La protezione dei dati è garantita dalle regole in `firestore.rules`.
