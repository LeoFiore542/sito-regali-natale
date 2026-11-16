import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { FamilyMember, GiftItem } from '../types';

const DB_NAME = 'NataleRegaliDB';
const DB_VERSION = 1;
const STORE_MEMBERS = 'members';
const STORE_GIFTS = 'gifts';
const LOCAL_STORAGE_ACTIVE_USER = 'natale_active_member_id';

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

// Helper per rimuovere i campi 'undefined' (anche annidati in array/oggetti) che causerebbero errore in Firestore
function sanitizeValue(val: any): any {
  if (Array.isArray(val)) {
    return val.map(sanitizeValue).filter((v) => v !== undefined);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        cleanObj[k] = sanitizeValue(v);
      }
    }
    return cleanObj;
  }
  return val;
}

function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  return sanitizeValue(obj);
}

// Inizializza IndexedDB locale (mantenuto per cache/backup)
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB non supportato'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_MEMBERS)) {
        idb.createObjectStore(STORE_MEMBERS, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_GIFTS)) {
        const giftStore = idb.createObjectStore(STORE_GIFTS, { keyPath: 'id' });
        giftStore.createIndex('memberId', 'memberId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Recupera eventuali dati salvati in precedenza nella memoria locale del dispositivo
async function getLocalCache(): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  try {
    const idb = await openDB();
    const members = await new Promise<FamilyMember[]>((resolve) => {
      const tx = idb.transaction(STORE_MEMBERS, 'readonly');
      const req = tx.objectStore(STORE_MEMBERS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const gifts = await new Promise<GiftItem[]>((resolve) => {
      const tx = idb.transaction(STORE_GIFTS, 'readonly');
      const req = tx.objectStore(STORE_GIFTS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    return { members, gifts };
  } catch {
    return { members: [], gifts: [] };
  }
}

// Salva in background la copia cache su IndexedDB
async function updateLocalCache(members: FamilyMember[], gifts: GiftItem[]) {
  try {
    const idb = await openDB();
    const tx = idb.transaction([STORE_MEMBERS, STORE_GIFTS], 'readwrite');
    const mStore = tx.objectStore(STORE_MEMBERS);
    const gStore = tx.objectStore(STORE_GIFTS);
    mStore.clear();
    gStore.clear();
    for (const m of members) mStore.put(m);
    for (const g of gifts) gStore.put(g);
  } catch (e) {
    console.debug('Cache update warning:', e);
  }
}

/**
 * Caricamento iniziale e sincronizzazione con Firestore Cloud:
 * 1. Recupera membri e regali dal Cloud.
 * 2. Se è il primo avvio del cloud, popola i 10 membri ufficiali e migra eventuali regali locali di Leo!
 */
export async function loadInitialData(): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  try {
    const membersCol = collection(db, 'members');
    const giftsCol = collection(db, 'gifts');

    const [membersSnap, giftsSnap] = await Promise.all([
      getDocs(membersCol),
      getDocs(giftsCol),
    ]);

    let cloudMembers: FamilyMember[] = membersSnap.docs.map((d) => d.data() as FamilyMember);
    let cloudGifts: GiftItem[] = giftsSnap.docs.map((d) => d.data() as GiftItem);

    // Se il database Cloud è vuoto o mancano i membri ufficiali, inizializziamo
    if (cloudMembers.length === 0) {
      console.log('Inizializzazione Cloud Firestore per la famiglia...');
      const batch = writeBatch(db);

      // Inserisci i membri ufficiali
      for (const m of OFFICIAL_FAMILY_MEMBERS) {
        batch.set(doc(db, 'members', m.id), sanitizeForFirestore(m));
      }

      // Migra eventuali regali creati in precedenza sul dispositivo locale (es. Leo)
      const local = await getLocalCache();
      const existingValidGifts = local.gifts.filter((g) => !['g-1', 'g-2', 'g-3'].includes(g.id));
      for (const g of existingValidGifts) {
        batch.set(doc(db, 'gifts', g.id), sanitizeForFirestore(g));
      }

      await batch.commit();

      cloudMembers = OFFICIAL_FAMILY_MEMBERS;
      cloudGifts = existingValidGifts;
    } else {
      // Assicurati che tutti i 10 membri ufficiali siano presenti
      const missingMembers = OFFICIAL_FAMILY_MEMBERS.filter(
        (official) => !cloudMembers.some((m) => m.id === official.id)
      );
      if (missingMembers.length > 0) {
        for (const missing of missingMembers) {
          await setDoc(doc(db, 'members', missing.id), sanitizeForFirestore(missing));
          cloudMembers.push(missing);
        }
      }
    }

    // Ordina i membri secondo l'ordine ufficiale
    cloudMembers.sort((a, b) => a.createdAt - b.createdAt);
    // Ordina i regali per data decrescente
    cloudGifts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Aggiorna cache locale
    updateLocalCache(cloudMembers, cloudGifts);

    return { members: cloudMembers, gifts: cloudGifts };
  } catch (err) {
    console.error('Errore connessione Firestore, fallback locale:', err);
    const local = await getLocalCache();
    const members = local.members.length > 0 ? local.members : OFFICIAL_FAMILY_MEMBERS;
    return { members, gifts: local.gifts };
  }
}

/**
 * Sottoscrizione Real-time indipendente per regali e membri:
 * Evita interferenze e garantisce deduplicazione.
 */
export function subscribeToGifts(onGifts: (gifts: GiftItem[]) => void): () => void {
  return onSnapshot(
    collection(db, 'gifts'),
    (snap) => {
      const map = new Map<string, GiftItem>();
      snap.docs.forEach((d) => {
        const item = d.data() as GiftItem;
        map.set(item.id, item);
      });
      const list = Array.from(map.values());
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onGifts(list);
    },
    (error) => {
      console.warn('Realtime snapshot gifts error:', error);
    }
  );
}

export function subscribeToMembers(onMembers: (members: FamilyMember[]) => void): () => void {
  return onSnapshot(
    collection(db, 'members'),
    (snap) => {
      if (!snap.empty) {
        const map = new Map<string, FamilyMember>();
        snap.docs.forEach((d) => {
          const item = d.data() as FamilyMember;
          map.set(item.id, item);
        });
        const list = Array.from(map.values());
        list.sort((a, b) => a.createdAt - b.createdAt);
        onMembers(list);
      }
    },
    (error) => {
      console.warn('Realtime snapshot members error:', error);
    }
  );
}

export async function saveMember(member: FamilyMember): Promise<void> {
  try {
    const clean = sanitizeForFirestore(member);
    await setDoc(doc(db, 'members', member.id), clean, { merge: true });
  } catch (e) {
    console.error('Errore salvataggio membro su Firestore:', e);
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (e) {
    console.error('Errore eliminazione membro su Firestore:', e);
  }
}

export async function saveGift(gift: GiftItem): Promise<void> {
  try {
    const clean = sanitizeForFirestore(gift);
    await setDoc(doc(db, 'gifts', gift.id), clean, { merge: true });
  } catch (e) {
    console.error('Errore salvataggio regalo su Firestore:', e);
    throw e;
  }
}

export async function deleteGift(giftId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gifts', giftId));
  } catch (e) {
    console.error('Errore eliminazione regalo su Firestore:', e);
    throw e;
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

// Esporta intero database come JSON per backup
export async function exportDatabaseJSON(): Promise<string> {
  const { members, gifts } = await loadInitialData();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '2.0-cloud',
    members,
    gifts,
  };
  return JSON.stringify(payload, null, 2);
}

// Importa dati da JSON
export async function importDatabaseJSON(jsonStr: string, _merge: boolean = false): Promise<{ members: FamilyMember[]; gifts: GiftItem[] }> {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data.members) || !Array.isArray(data.gifts)) {
    throw new Error('Formato file non valido.');
  }

  const batch = writeBatch(db);
  for (const m of data.members) {
    batch.set(doc(db, 'members', m.id), sanitizeForFirestore(m));
  }
  for (const g of data.gifts) {
    batch.set(doc(db, 'gifts', g.id), sanitizeForFirestore(g));
  }
  await batch.commit();

  return { members: data.members, gifts: data.gifts };
}
