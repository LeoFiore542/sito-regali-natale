export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji natalizia o iniziale
  color?: string;
  role?: string; // es. Mamma, Papà, Bambino...
  bannerTheme?: string; // Tema colore del banner
  bannerPattern?: 'stars' | 'snow' | 'dots' | 'none'; // Pattern di sfondo del banner
  bio?: string; // Motto natalizio o nota
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
  price?: string; // Prezzo stimato/ricavato dal link di acquisto
  storeName?: string; // Negozio rilevato dal link (es. Amazon, Zalando)
  priority?: PriorityLevel;
  reservedBy?: string | null; // Nome di chi lo compra
  createdAt: number;
}

export interface FamilyState {
  members: FamilyMember[];
  gifts: GiftItem[];
  currentMemberId: string | null;
}
