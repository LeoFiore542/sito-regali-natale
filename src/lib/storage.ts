import { FamilyMember, GiftItem } from '../types';

const DB_NAME = 'NataleRegaliDB';
const DB_VERSION = 1;
const STORE_MEMBERS = 'members';
const STORE_GIFTS = 'gifts';
const LOCAL_STORAGE_ACTIVE_USER = 'natale_active_member_id';

// Inizializza IndexedDB nativo (supporta megabyte di immagini Base64 senza limiti)
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB non supportato'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEMBERS)) {
        db.createObjectStore(STORE_MEMBERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_GIFTS)) {
        const giftStore = db.createObjectStore(STORE_GIFTS, { keyPath: 'id' });
        giftStore.createIndex('memberId', 'memberId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback su localStorage se IndexedDB fallisce
const localStorageFallback = {
  getMembers(): FamilyMember[] {
    try {
      const raw = localStorage.getItem('natale_members');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveMembers(members: FamilyMember[]) {
    localStorage.setItem('natale_members', JSON.stringify(members));
  },
  getGifts(): GiftItem[] {
    try {
      const raw = localStorage.getItem('natale_gifts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveGifts(gifts: GiftItem[]) {
    localStorage.setItem('natale_gifts', JSON.stringify(gifts));
  }
};

export const OFFICIAL_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'leo', name: 'Leo', avatar: '🎄', createdAt: 1 },
  { id: 'benedetta', name: 'Benedetta', avatar: '✨', createdAt: 2 },
  { id: 'simone', name: 'Simone', avatar: '⛄', createdAt: 3 },
  { id: 'roberto', name: 'Roberto', avatar: '🎅', createdAt: 4 },
  { id: 'rita', name: 'Rita', avatar: '🤶', createdAt: 5 },
  { id: 'fabrizio', name: 'Fabrizio', avatar: '🦌', createdAt: 6 },
  { id: 'francesca', name: 'Francesca', avatar: '⭐', createdAt: 7 },
  { id: 'mario', name: 'Mario', avatar: '🎁', createdAt: 8 },
  { id: 'francesco', name: 'Francesco', avatar: '🧝', createdAt: 9 },
  { id: 'giuliana', name: 'Giuliana', avatar: '🍪', createdAt: 10 },
];

export async function loadInitialData(): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  try {
    const db = await openDB();
    let members = await new Promise<FamilyMember[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MEMBERS, 'readonly');
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    let gifts = await new Promise<GiftItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readonly');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const isMigrated = localStorage.getItem('natale_family_v2_migrated') === 'true';

    // Se non sono ancora stati caricati i membri della famiglia o se c'erano i vecchi dati finti
    const hasOldDummies = members.some((m) => m.name === 'Mamma' || m.name === 'Papà' || m.name === 'Io');

    if (members.length === 0 || !isMigrated || hasOldDummies) {
      const tx = db.transaction([STORE_MEMBERS, STORE_GIFTS], 'readwrite');
      const mStore = tx.objectStore(STORE_MEMBERS);
      const gStore = tx.objectStore(STORE_GIFTS);

      // Pulisci vecchi membri demo
      mStore.clear();
      // Se c'erano solo i regali finti demo (g-1, g-2, g-3), ripuliscili
      const userGifts = gifts.filter((g) => !['g-1', 'g-2', 'g-3'].includes(g.id));
      gStore.clear();

      for (const m of OFFICIAL_FAMILY_MEMBERS) {
        mStore.put(m);
      }
      for (const g of userGifts) {
        gStore.put(g);
      }

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
      });

      localStorage.setItem('natale_family_v2_migrated', 'true');
      members = OFFICIAL_FAMILY_MEMBERS;
      gifts = userGifts;
      return { members, gifts };
    }

    return { members, gifts };
  } catch (e) {
    console.warn('Fallback a localStorage:', e);
    localStorage.setItem('natale_members', JSON.stringify(OFFICIAL_FAMILY_MEMBERS));
    const gifts = localStorageFallback.getGifts().filter((g) => !['g-1', 'g-2', 'g-3'].includes(g.id));
    localStorageFallback.saveGifts(gifts);
    return { members: OFFICIAL_FAMILY_MEMBERS, gifts };
  }
}

export async function saveMember(member: FamilyMember): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_MEMBERS, 'readwrite');
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.put(member);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const members = localStorageFallback.getMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx >= 0) members[idx] = member;
    else members.push(member);
    localStorageFallback.saveMembers(members);
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_MEMBERS, STORE_GIFTS], 'readwrite');
    tx.objectStore(STORE_MEMBERS).delete(memberId);
    
    // Rimuovi anche i regali associati
    const giftsStore = tx.objectStore(STORE_GIFTS);
    const index = giftsStore.index('memberId');
    const req = index.getAllKeys(memberId);
    req.onsuccess = () => {
      for (const key of req.result) {
        giftsStore.delete(key);
      }
    };
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch {
    const members = localStorageFallback.getMembers().filter(m => m.id !== memberId);
    localStorageFallback.saveMembers(members);
    const gifts = localStorageFallback.getGifts().filter(g => g.memberId !== memberId);
    localStorageFallback.saveGifts(gifts);
  }
}

export async function saveGift(gift: GiftItem): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readwrite');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.put(gift);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const gifts = localStorageFallback.getGifts();
    const idx = gifts.findIndex(g => g.id === gift.id);
    if (idx >= 0) gifts[idx] = gift;
    else gifts.push(gift);
    localStorageFallback.saveGifts(gifts);
  }
}

export async function deleteGift(giftId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readwrite');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.delete(giftId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const gifts = localStorageFallback.getGifts().filter(g => g.id !== giftId);
    localStorageFallback.saveGifts(gifts);
  }
}

export function getActiveMemberId(): string | null {
  return localStorage.getItem(LOCAL_STORAGE_ACTIVE_USER);
}

export function setActiveMemberId(id: string | null) {
  if (id) {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER, id);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_USER);
  }
}

// Esporta intero database come JSON per backup / invio via file
export async function exportDatabaseJSON(): Promise<string> {
  const { members, gifts } = await loadInitialData();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    members,
    gifts,
  };
  return JSON.stringify(payload, null, 2);
}

// Importa dati da JSON (sovrascrive o unisce)
export async function importDatabaseJSON(jsonStr: string, merge: boolean = false): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data.members) || !Array.isArray(data.gifts)) {
    throw new Error('Formato file non valido.');
  }

  const db = await openDB();
  const tx = db.transaction([STORE_MEMBERS, STORE_GIFTS], 'readwrite');
  const mStore = tx.objectStore(STORE_MEMBERS);
  const gStore = tx.objectStore(STORE_GIFTS);

  if (!merge) {
    mStore.clear();
    gStore.clear();
  }

  for (const m of data.members) {
    mStore.put(m);
  }
  for (const g of data.gifts) {
    gStore.put(g);
  }

  await new Promise<void>((resolve) => {
    tx.oncomplete = () => resolve();
  });

  return { members: data.members, gifts: data.gifts };
}
