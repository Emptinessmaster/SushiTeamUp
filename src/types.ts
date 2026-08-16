import type { Timestamp } from 'firebase/firestore';

export interface Member {
  uid: string;
  displayName: string;
  photoURL: string | null;
  joinedAt: Timestamp | null;
}

export interface Room {
  id: string;
  name: string;
  restaurant: string;
  ownerId: string;
  ownerName: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
  /** map uid -> Member */
  members: Record<string, Member>;
}

/** Una singola riga di un ordine: numero del piatto x quantita' */
export interface OrderItem {
  dish: string;
  quantity: number;
}

export type OrderStatus = 'pending' | 'completed';

/** Un "ordine" = una portata inviata (un giro), con una o piu' righe */
export interface Order {
  id: string;
  roundNumber: number;
  createdBy: string;
  createdByName: string;
  createdByPhoto: string | null;
  createdAt: Timestamp | null;
  completedAt: Timestamp | null;
  status: OrderStatus;
  items: OrderItem[];
}
