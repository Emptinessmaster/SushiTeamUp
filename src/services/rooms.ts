import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase';
import type { Order, OrderItem, Room } from '../types';

const ROOM_TTL_MS = 24 * 60 * 60 * 1000; // 24 ore

/** Genera un codice stanza breve e leggibile (es. "K4P7QX"). */
function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // niente 0/O/1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function memberFromUser(user: User) {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Ospite',
    photoURL: user.photoURL ?? null,
    joinedAt: serverTimestamp(),
  };
}

/** Crea una nuova stanza (valida 24 ore) e vi aggiunge il creatore. */
export async function createRoom(
  user: User,
  name: string,
  restaurant: string,
): Promise<string> {
  // Prova alcuni codici finche' ne trova uno libero.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateRoomCode();
    const ref = doc(db, 'rooms', code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;

    const now = Date.now();
    await setDoc(ref, {
      name: name.trim() || 'Cena AYCE',
      restaurant: restaurant.trim(),
      ownerId: user.uid,
      ownerName: user.displayName ?? 'Ospite',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + ROOM_TTL_MS),
      members: { [user.uid]: memberFromUser(user) },
    });
    return code;
  }
  throw new Error('Impossibile generare un codice stanza, riprova.');
}

/** Aggiunge l'utente corrente ai partecipanti della stanza. */
export async function joinRoom(user: User, roomId: string): Promise<void> {
  const ref = doc(db, 'rooms', roomId.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Stanza non trovata. Controlla il codice.');
  }
  const data = snap.data() as Room;
  const expiresAt = data.expiresAt?.toMillis?.() ?? 0;
  if (expiresAt && expiresAt < Date.now()) {
    throw new Error('Questa stanza e\' scaduta (durata massima 24 ore).');
  }
  await updateDoc(ref, {
    [`members.${user.uid}`]: memberFromUser(user),
  });
}

export function isExpired(room: Room | null): boolean {
  if (!room) return false;
  const expiresAt = room.expiresAt?.toMillis?.() ?? 0;
  return expiresAt > 0 && expiresAt < Date.now();
}

/** Ascolta in tempo reale una stanza. */
export function subscribeRoom(
  roomId: string,
  cb: (room: Room | null) => void,
  onError?: (e: Error) => void,
) {
  const ref = doc(db, 'rooms', roomId.toUpperCase());
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      cb({ id: snap.id, ...(snap.data() as Omit<Room, 'id'>) });
    },
    (err) => onError?.(err),
  );
}

/** Ascolta in tempo reale gli ordini di una stanza (piu' recenti in cima). */
export function subscribeOrders(
  roomId: string,
  cb: (orders: Order[]) => void,
  onError?: (e: Error) => void,
) {
  const ref = collection(db, 'rooms', roomId.toUpperCase(), 'orders');
  const q = query(ref, orderBy('roundNumber', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
      cb(orders);
    },
    (err) => onError?.(err),
  );
}

/** Ascolta le stanze create dall'utente (per la home). */
export function subscribeMyRooms(
  uid: string,
  cb: (rooms: Room[]) => void,
) {
  const ref = collection(db, 'rooms');
  const q = query(ref, where('ownerId', '==', uid));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Room, 'id'>) }))
      .filter((r) => !isExpired(r))
      .sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
      );
    cb(rooms);
  });
}

/**
 * Invia un nuovo ordine (un "giro") con una o piu' righe piatto x quantita'.
 * Usa una transazione per assegnare un numero d'ordine progressivo alla stanza.
 */
export async function submitOrder(
  user: User,
  roomId: string,
  items: OrderItem[],
): Promise<void> {
  const cleanItems = items
    .map((it) => ({ dish: it.dish.trim(), quantity: Math.max(1, Math.floor(it.quantity)) }))
    .filter((it) => it.dish.length > 0);
  if (cleanItems.length === 0) throw new Error('Aggiungi almeno un piatto.');

  const roomRef = doc(db, 'rooms', roomId.toUpperCase());
  const ordersRef = collection(roomRef, 'orders');
  const newOrderRef = doc(ordersRef);

  await runTransaction(db, async (tx) => {
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error('Stanza non trovata.');
    const roundNumber = (roomSnap.data().nextRound as number | undefined) ?? 1;

    tx.set(newOrderRef, {
      roundNumber,
      createdBy: user.uid,
      createdByName: user.displayName ?? 'Ospite',
      createdByPhoto: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      completedAt: null,
      status: 'pending',
      items: cleanItems,
    });
    tx.update(roomRef, { nextRound: roundNumber + 1 });
  });
}

/** Segna un ordine come effettuato / da fare. */
export async function setOrderStatus(
  roomId: string,
  orderId: string,
  status: 'pending' | 'completed',
): Promise<void> {
  const ref = doc(db, 'rooms', roomId.toUpperCase(), 'orders', orderId);
  await updateDoc(ref, {
    status,
    completedAt: status === 'completed' ? serverTimestamp() : null,
  });
}

/** Elimina un ordine. */
export async function deleteOrder(roomId: string, orderId: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', roomId.toUpperCase(), 'orders', orderId));
}

/**
 * Svuota gli ordini attivi (da servire) che l'utente può eliminare:
 * i propri ordini, oppure tutti se è il proprietario della stanza.
 * Restituisce il numero di ordini eliminati.
 */
export async function clearPendingOrders(
  roomId: string,
  orders: Order[],
  uid: string,
  ownerId: string,
): Promise<number> {
  const deletable = orders.filter(
    (o) => o.status === 'pending' && (o.createdBy === uid || ownerId === uid),
  );
  if (deletable.length === 0) return 0;

  const code = roomId.toUpperCase();
  // Firestore consente max 500 operazioni per batch: spezziamo per sicurezza.
  for (let i = 0; i < deletable.length; i += 400) {
    const batch = writeBatch(db);
    for (const o of deletable.slice(i, i + 400)) {
      batch.delete(doc(db, 'rooms', code, 'orders', o.id));
    }
    await batch.commit();
  }
  return deletable.length;
}
