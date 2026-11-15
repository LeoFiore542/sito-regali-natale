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

export async function loadInitialData(): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  try {
    const db = await openDB();
    const members = await new Promise<FamilyMember[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MEMBERS, 'readonly');
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const gifts = await new Promise<GiftItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readonly');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (members.length === 0) {
      // Dati demo iniziali per un'accoglienza calorosa
      const defaultMembers: FamilyMember[] = [
        { id: '1', name: 'Mamma', avatar: '🤶', color: 'bg-rose-500', createdAt: Date.now() - 3000 },
        { id: '2', name: 'Papà', avatar: '🎅', color: 'bg-emerald-600', createdAt: Date.now() - 2000 },
        { id: '3', name: 'Io', avatar: '🎄', color: 'bg-amber-500', createdAt: Date.now() - 1000 },
      ];
      const defaultGifts: GiftItem[] = [
        {
          id: 'g-1',
          memberId: '1',
          title: 'Macchina per caffè espresso compatta',
          description: 'Colore rosso o nero, possibilmente compatibile con cialde ESE o polvere.',
          link: 'https://www.amazon.it',
          imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
          price: '85€',
          priority: 'alta',
          createdAt: Date.now() - 1500,
        },
        {
          id: 'g-2',
          memberId: '2',
          title: 'Set di attrezzi da barbecue in acciaio',
          description: 'Con valigetta in alluminio e guanto termico.',
          link: 'https://www.amazon.it',
          imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
          price: '40€',
          priority: 'media',
          createdAt: Date.now() - 1200,
        },
        {
          id: 'g-3',
          memberId: '3',
          title: 'Cuffie Bluetooth con cancellazione rumore',
          description: 'Over-ear comode per lavorare e ascoltare musica in viaggio.',
          link: 'https://www.amazon.it',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          price: '99€',
          priority: 'alta',
          createdAt: Date.now() - 800,
        }
      ];

      for (const m of defaultMembers) {
        await saveMember(m);
      }
      for (const g of defaultGifts) {
        await saveGift(g);
      }

      return { members: defaultMembers, gifts: defaultGifts };
    }

    return { members, gifts };
  } catch (e) {
    console.warn('Fallback a localStorage:', e);
    const members = localStorageFallback.getMembers();
    const gifts = localStorageFallback.getGifts();
    return { members, gifts };
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
