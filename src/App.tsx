import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember, GiftItem } from './types';
import {
  loadInitialData,
  saveMember,
  deleteMember as removeMemberStorage,
  saveGift,
  deleteGift as removeGiftStorage,
  setActiveMemberId,
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { MemberSelector } from './components/MemberSelector';
import { GiftCard } from './components/GiftCard';
import { AddGiftModal } from './components/AddGiftModal';
import { BackupModal } from './components/BackupModal';
import { ManageMembersModal } from './components/ManageMembersModal';
import { WhoAreYouModal } from './components/WhoAreYouModal';
import { SnowEffect } from './components/SnowEffect';
import { Plus, Search, Sparkles, UserCheck } from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';

export const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWhoAreYouOpen, setIsWhoAreYouOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snowing, setSnowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [giftToEdit, setGiftToEdit] = useState<GiftItem | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Caricamento iniziale
  useEffect(() => {
    loadInitialData().then(({ members, gifts }) => {
      setMembers(members);
      setGifts(gifts);

      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser && members.some((m) => m.id === savedUser)) {
        setCurrentUserId(savedUser);
        setSelectedMemberId(savedUser);
      } else {
        // La prima cosa che il sito chiede è chi sei!
        setIsWhoAreYouOpen(true);
        setSelectedMemberId('all');
      }

      setIsLoading(false);
    });
  }, []);

  // Seleziona chi sei (identità)
  const handleSelectUserIdentity = (member: FamilyMember) => {
    setCurrentUserId(member.id);
    localStorage.setItem(CURRENT_USER_KEY, member.id);
    setSelectedMemberId(member.id);
    setActiveMemberId(member.id);
    setIsWhoAreYouOpen(false);
  };

  // Esplora senza identificarsi subito
  const handleExploreAll = () => {
    setSelectedMemberId('all');
    setIsWhoAreYouOpen(false);
  };

  // Aggiorna membro visualizzato
  const handleSelectMember = (id: string | 'all') => {
    setSelectedMemberId(id);
    setActiveMemberId(id === 'all' ? null : id);
  };

  // Conteggio regali per membro
  const giftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    gifts.forEach((g) => {
      counts[g.memberId] = (counts[g.memberId] || 0) + 1;
    });
    return counts;
  }, [gifts]);

  // Aggiungi nuovo membro
  const handleAddMember = async (name: string, avatar: string) => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name,
      avatar,
      createdAt: Date.now(),
    };
    await saveMember(newMember);
    setMembers((prev) => [...prev, newMember]);
    setSelectedMemberId(newMember.id);
    setActiveMemberId(newMember.id);
  };

  // Aggiorna membro
  const handleUpdateMember = async (updated: FamilyMember) => {
    await saveMember(updated);
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Elimina membro
  const handleDeleteMember = async (id: string) => {
    await removeMemberStorage(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setGifts((prev) => prev.filter((g) => g.memberId !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId('all');
    }
    if (currentUserId === id) {
      setCurrentUserId(null);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  // Salva regalo (nuovo o modificato)
  const handleSaveGift = async (giftData: Omit<GiftItem, 'id' | 'createdAt'>) => {
    if (giftToEdit) {
      const updated: GiftItem = {
        ...giftToEdit,
        ...giftData,
      };
      await saveGift(updated);
      setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setGiftToEdit(null);
    } else {
      const newGift: GiftItem = {
        ...giftData,
        id: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      await saveGift(newGift);
      setGifts((prev) => [newGift, ...prev]);
    }
  };

  // Elimina regalo
  const handleDeleteGift = async (id: string) => {
    await removeGiftStorage(id);
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  // Toggle "Prenotato / Ci penso io"
  const handleToggleReserve = async (gift: GiftItem) => {
    let buyerName: string | null = null;
    const currentUserObj = members.find((m) => m.id === currentUserId);

    if (!gift.reservedBy) {
      const defaultName = currentUserObj ? currentUserObj.name : 'Io';
      const promptName = prompt(
        `Chi acquisterà questo regalo? (Inserisci il tuo nome per avvisare la famiglia)`,
        defaultName
      );
      if (!promptName || !promptName.trim()) return;
      buyerName = promptName.trim();
    } else {
      const confirmRemove = confirm(`Vuoi rimuovere la prenotazione da parte di ${gift.reservedBy}?`);
      if (!confirmRemove) return;
      buyerName = null;
    }

    const updated: GiftItem = {
      ...gift,
      reservedBy: buyerName,
    };
    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  // Filtra regali
  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      // Filtro membro
      if (selectedMemberId !== 'all' && gift.memberId !== selectedMemberId) {
        return false;
      }
      // Filtro ricerca testuale
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = gift.title.toLowerCase().includes(q);
        const matchDesc = gift.description?.toLowerCase().includes(q) ?? false;
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [gifts, selectedMemberId, searchQuery]);

  // Membro correntemente attivo per la visualizzazione
  const currentMember = useMemo(() => {
    if (selectedMemberId === 'all') return members[0] || null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Utente loggato
  const loggedUser = useMemo(() => {
    return members.find((m) => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f2] text-slate-700">
        <div className="w-16 h-16 rounded-3xl bg-red-600 text-white flex items-center justify-center text-3xl shadow-xl shadow-red-200 animate-bounce">
          🎁
        </div>
        <p className="mt-4 text-base font-semibold festive-font text-slate-800">
          Caricamento delle liste di Natale...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-slate-800 relative selection:bg-red-200">
      {/* Effetto fiocchi di neve */}
      <SnowEffect active={snowing} />

      {/* Navbar Principale */}
      <Navbar
        currentMember={currentMember}
        currentUser={loggedUser}
        onOpenWhoAreYou={() => setIsWhoAreYouOpen(true)}
        onOpenAddModal={() => {
          setGiftToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        snowing={snowing}
        toggleSnow={() => setSnowing(!snowing)}
        totalGiftsCount={gifts.length}
      />

      {/* Contenuto Principale */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Banner Natalizio di Benvenuto */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-800 via-rose-700 to-red-900 text-white p-6 sm:p-8 shadow-xl shadow-red-900/10">
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-52 h-52 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {loggedUser ? (
                  <span>Ciao, {loggedUser.name}! {loggedUser.avatar}</span>
                ) : (
                  <span>Natale in Famiglia</span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold festive-font tracking-wide leading-tight">
                {loggedUser
                  ? `${loggedUser.name}, cosa vorresti trovare sotto l'albero?`
                  : `Cosa vorresti trovare sotto l'albero?`}
              </h2>
              <p className="text-sm text-red-100/90 leading-relaxed">
                Aggiungi qui i tuoi desideri con foto, nome, note e link d'acquisto. Ognuno può compilare la propria lista e vedere quella degli altri!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-bold text-sm shadow-lg shadow-black/10 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-red-600 stroke-[3]" />
                <span>Aggiungi un Regalo</span>
              </button>

              <button
                onClick={() => setIsWhoAreYouOpen(true)}
                className="px-4 py-3 rounded-2xl bg-red-900/40 hover:bg-red-900/60 border border-red-400/30 text-white text-xs font-semibold backdrop-blur-sm transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>{loggedUser ? 'Cambia Profilo' : 'Chi sei?'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Selettore Membri / Famiglia */}
        <MemberSelector
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={handleSelectMember}
          onAddMember={handleAddMember}
          giftCounts={giftCounts}
        />

        {/* Barra di Ricerca e Info Lista */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold festive-font text-slate-900 flex items-center gap-2">
              {selectedMemberId === 'all' ? (
                <>
                  <span>✨</span>
                  <span>Tutti i desideri della famiglia</span>
                </>
              ) : (
                <>
                  <span>{currentMember?.avatar}</span>
                  <span>Lista desideri di {currentMember?.name}</span>
                </>
              )}
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredGifts.length}
            </span>
          </div>

          {/* Input di Ricerca */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca regalo per nome..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {/* Griglia Regali */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGifts.map((gift) => {
              const member = members.find((m) => m.id === gift.memberId);
              return (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  member={member}
                  showMemberBadge={selectedMemberId === 'all'}
                  onEdit={(g) => {
                    setGiftToEdit(g);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={handleDeleteGift}
                  onToggleReserve={handleToggleReserve}
                  currentUserId={currentUserId || undefined}
                />
              );
            })}
          </div>
        ) : (
          /* Stato Vuoto Accogliente */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-red-100 shadow-sm max-w-xl mx-auto my-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-3xl">
              {currentMember?.avatar || '🎅'}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 festive-font">
                {searchQuery
                  ? 'Nessun risultato trovato'
                  : selectedMemberId === 'all'
                  ? 'Nessun regalo ancora inserito nella famiglia'
                  : `La lista di ${currentMember?.name} è ancora vuota`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Prova a cercare un nome diverso o cancella il testo nel campo di ricerca.'
                  : 'Inizia subito aggiungendo il primo regalo desiderato per Natale!'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-xs sm:text-sm font-semibold shadow-md shadow-red-200 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi il primo regalo</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-sm py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center">
            <span>Realizzato con</span>
            <span className="text-red-500">❤️</span>
            <span>per il Natale in famiglia</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => setIsWhoAreYouOpen(true)}
              className="hover:text-red-600 transition-colors font-medium"
            >
              Cambia Profilo
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-red-600 transition-colors"
            >
              Condividi su WhatsApp
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-red-600 transition-colors"
            >
              Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Schermata Iniziale "Chi sei?" */}
      <WhoAreYouModal
        isOpen={isWhoAreYouOpen}
        members={members}
        onSelectUser={handleSelectUserIdentity}
        onExploreAll={handleExploreAll}
        canDismiss={!!currentUserId}
        onClose={() => setIsWhoAreYouOpen(false)}
      />

      {/* Modale Aggiungi / Modifica Regalo */}
      <AddGiftModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setGiftToEdit(null);
        }}
        onSave={handleSaveGift}
        members={members}
        initialMemberId={
          currentUserId && members.some((m) => m.id === currentUserId)
            ? currentUserId
            : selectedMemberId === 'all'
            ? (members[0]?.id ?? '')
            : selectedMemberId
        }
        giftToEdit={giftToEdit}
      />

      {/* Modale Condividi & Backup */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        members={members}
        gifts={gifts}
        onDataImported={({ members, gifts }) => {
          setMembers(members);
          setGifts(gifts);
        }}
      />

      {/* Modale Gestione Membri */}
      <ManageMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        giftCounts={giftCounts}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
};
