export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji natalizia o iniziale
  color?: string;
  role?: string; // es. Mamma, Papà, Bambino...
  createdAt: number;
}

export type PriorityLevel = 'alta' | 'media' | 'bassa';

export interface GiftItem {
  id: string;
  memberId: string;
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string; // Può essere URL web o data:image/... in base64
  price?: string;
  priority?: PriorityLevel;
  reservedBy?: string | null; // Nome di chi lo compra (per evitare regali doppi)
  createdAt: number;
}

export interface FamilyState {
  members: FamilyMember[];
  gifts: GiftItem[];
  currentMemberId: string | null;
}
