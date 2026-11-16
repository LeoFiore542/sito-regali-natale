export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji natalizia o iniziale
  color?: string;
  role?: string; // es. Mamma, Papà, Bambino...
  bannerTheme?: string; // Tema colore del banner
  bannerPattern?: 'stars' | 'snow' | 'dots' | 'none'; // Pattern di sfondo del banner
  bio?: string; // Motto natalizio o nota
  isGroup?: boolean; // True se è un gruppo di persone che chiedono un regalo condiviso (creato dall'Admin)
  groupMemberIds?: string[]; // ID dei singoli familiari che compongono il gruppo
  createdAt: number;
}

export type PriorityLevel = 'alta' | 'media' | 'bassa';

export type ReservationMode = 'solo' | 'split';

export interface GiftParticipant {
  memberId: string;
  name: string;
  avatar?: string;
  joinedAt: number;
}

export interface GiftItem {
  id: string;
  memberId: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string; // Può essere URL web o data:image/... in base64
  price?: string; // Prezzo stimato/ricavato dal link di acquisto o inserito manualmente
  storeName?: string; // Negozio rilevato dal link (es. Amazon, Zalando)
  priority?: PriorityLevel;
  reservedBy?: string | null; // Nome/i di chi lo compra
  reservationMode?: ReservationMode | null; // 'solo' = da solo (chiuso), 'split' = aperto per dividere la spesa
  participants?: GiftParticipant[]; // Partecipanti che dividono la spesa (o singolo acquirente)
  createdAt: number;
}

export interface FamilyState {
  members: FamilyMember[];
  gifts: GiftItem[];
  currentMemberId: string | null;
}

/**
 * Restituisce true se l'utente indicato è il destinatario del regalo
 * oppure fa parte del gruppo destinatario del regalo condiviso.
 * Serve a proteggere l'effetto sorpresa per TUTTI i membri del gruppo!
 */
export function isUserRecipientOfGift(
  userId: string | null | undefined,
  gift: GiftItem,
  members: FamilyMember[]
): boolean {
  if (!userId) return false;
  if (gift.memberId === userId) return true;
  const owner = members.find((m) => m.id === gift.memberId);
  if (owner?.isGroup && Array.isArray(owner.groupMemberIds)) {
    return owner.groupMemberIds.includes(userId);
  }
  return false;
}

/**
 * Restituisce true se l'utente è il membro selezionato oppure appartiene al gruppo selezionato.
 */
export function isUserInMemberOrGroup(
  userId: string | null | undefined,
  member: FamilyMember | null | undefined
): boolean {
  if (!userId || !member) return false;
  if (member.id === userId) return true;
  if (member.isGroup && Array.isArray(member.groupMemberIds)) {
    return member.groupMemberIds.includes(userId);
  }
  return false;
}

/**
 * Restituisce i profili dei membri che compongono un gruppo.
 */
export function getGroupMembers(
  group: FamilyMember | undefined | null,
  allMembers: FamilyMember[]
): FamilyMember[] {
  if (!group?.isGroup || !Array.isArray(group.groupMemberIds)) return [];
  return group.groupMemberIds
    .map((id) => allMembers.find((m) => m.id === id))
    .filter((m): m is FamilyMember => Boolean(m));
}

/**
 * Restituisce la lista normalizzata dei partecipanti all'acquisto di un regalo
 * (retrocompatibile con i regali che hanno solo `reservedBy`).
 */
export function getGiftParticipants(gift: GiftItem): GiftParticipant[] {
  if (Array.isArray(gift.participants) && gift.participants.length > 0) {
    return gift.participants;
  }
  if (gift.reservedBy && gift.reservedBy.trim()) {
    return [
      {
        memberId: '',
        name: gift.reservedBy.trim(),
        joinedAt: gift.createdAt || Date.now(),
      },
    ];
  }
  return [];
}

/**
 * Restituisce la modalità di prenotazione effettiva ('solo', 'split' o null se libero).
 */
export function getEffectiveReservationMode(gift: GiftItem): ReservationMode | null {
  const participants = getGiftParticipants(gift);
  if (participants.length === 0) return null;
  if (gift.reservationMode === 'split' || participants.length > 1) {
    return 'split';
  }
  return 'solo';
}

/**
 * Controlla se l'utente corrente partecipa già all'acquisto del regalo.
 */
export function isUserParticipating(
  gift: GiftItem,
  userId?: string | null,
  userName?: string | null
): boolean {
  const participants = getGiftParticipants(gift);
  return participants.some((p) => {
    if (userId && p.memberId && p.memberId === userId) return true;
    if (userName && p.name.trim().toLowerCase() === userName.trim().toLowerCase()) return true;
    return false;
  });
}

