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
import { getBannerTheme } from './lib/bannerThemes';
import { Navbar } from './components/Navbar';
import { MemberSelector } from './components/MemberSelector';
import { GiftCard } from './components/GiftCard';
import { AddGiftModal } from './components/AddGiftModal';
import { BackupModal } from './components/BackupModal';
import { ManageMembersModal } from './components/ManageMembersModal';
import { WhoAreYouModal } from './components/WhoAreYouModal';
import { EditProfileModal } from './components/EditProfileModal';
import { SnowEffect } from './components/SnowEffect';
import { Plus, Search, Sparkles, UserCheck, Palette } from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';

export const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWhoAreYouOpen, setIsWhoAreYouOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<FamilyMember | null>(null);
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

  // Salva aggiornamenti profilo membro
  const handleSaveProfile = async (updated: FamilyMember) => {
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
    if (selectedMemberId === 'all') return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Utente loggato
  const loggedUser = useMemo(() => {
    return members.find((m) => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  // Tema del banner attivo
  const activeBannerTheme = useMemo(() => {
    if (currentMember) {
      return getBannerTheme(currentMember.bannerTheme);
    }
    if (loggedUser) {
      return getBannerTheme(loggedUser.bannerTheme);
    }
    return getBannerTheme('red-christmas');
  }, [currentMember, loggedUser]);

  // Apri personalizzazione per un membro
  const openEditProfileFor = (member: FamilyMember) => {
    setProfileToEdit(member);
    setIsEditProfileOpen(true);
  };

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
        currentMember={currentMember || members[0] || null}
        currentUser={loggedUser}
        onOpenWhoAreYou={() => setIsWhoAreYouOpen(true)}
        onOpenEditProfile={() => {
          if (loggedUser) openEditProfileFor(loggedUser);
        }}
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
        {/* Banner Natalizio Dinamico Personalizzato */}
        <section
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeBannerTheme.gradientClass} text-white p-6 sm:p-8 shadow-xl shadow-black/10 transition-all duration-500`}
        >
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white/95 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {currentMember ? (
                  <span>Lista Desideri di {currentMember.name} {currentMember.avatar}</span>
                ) : loggedUser ? (
                  <span>Ciao, {loggedUser.name}! {loggedUser.avatar}</span>
                ) : (
                  <span>Natale in Famiglia</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentMember && (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                    {currentMember.avatar}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold festive-font tracking-wide leading-tight">
                    {currentMember
                      ? `I Desideri di ${currentMember.name}`
                      : loggedUser
                      ? `${loggedUser.name}, cosa vorresti ricevere?`
                      : `Cosa vorresti trovare sotto l'albero?`}
                  </h2>
                  {currentMember?.bio && (
                    <p className="text-xs sm:text-sm text-white/90 italic mt-1 font-serif">
                      "{currentMember.bio}"
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {currentMember
                  ? `Ecco cosa vorrebbe ricevere ${currentMember.name} per Natale. Puoi aggiungere un link o segnare cosa comprerai per evitare doppioni!`
                  : `Seleziona il tuo nome o guarda le liste degli altri per organizzare i regali perfetti!`}
              </p>
            </div>

            {/* Pulsanti Rapidi Banner */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-lg shadow-black/15 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-red-600 stroke-[3]" />
                <span>Aggiungi Regalo</span>
              </button>

              {/* Pulsante Personalizza Profilo */}
              {(currentMember || loggedUser) && (
                <button
                  onClick={() => {
                    const target = currentMember || loggedUser;
                    if (target) openEditProfileFor(target);
                  }}
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
                  title="Modifica colore del banner, emoji, nome e motto"
                >
                  <Palette className="w-4 h-4 text-amber-300" />
                  <span>Personalizza Profilo</span>
                </button>
              )}

              <button
                onClick={() => setIsWhoAreYouOpen(true)}
                className="px-3.5 py-3 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm transition-colors flex items-center gap-1.5"
                title="Cambia membro della famiglia"
              >
                <UserCheck className="w-4 h-4 text-white/80" />
                <span className="hidden sm:inline">Chi sei?</span>
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
              onClick={() => {
                if (loggedUser) openEditProfileFor(loggedUser);
              }}
              className="hover:text-red-600 transition-colors font-medium"
            >
              Personalizza Profilo
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-red-600 transition-colors"
            >
              Condividi su WhatsApp
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

      {/* Modale Personalizzazione Profilo */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        member={profileToEdit}
        onClose={() => {
          setIsEditProfileOpen(false);
          setProfileToEdit(null);
        }}
        onSave={handleSaveProfile}
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
        onUpdateMember={handleSaveProfile}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
};
