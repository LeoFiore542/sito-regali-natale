import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember, GiftItem } from './types';
import {
  loadInitialData,
  saveMember,
  deleteMember as removeMemberStorage,
  saveGift,
  deleteGift as removeGiftStorage,
  setActiveMemberId,
  OFFICIAL_FAMILY_MEMBERS,
} from './lib/storage';
import { getBannerTheme } from './lib/bannerThemes';
import { Navbar } from './components/Navbar';
import { MemberSelector } from './components/MemberSelector';
import { GiftCard } from './components/GiftCard';
import { AddGiftModal } from './components/AddGiftModal';
import { ManageMembersModal } from './components/ManageMembersModal';
import { WhoAreYouModal } from './components/WhoAreYouModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SnowEffect } from './components/SnowEffect';
import { Plus, Search, Sparkles, Palette, Crown } from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';

export const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWhoAreYouOpen, setIsWhoAreYouOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snowing, setSnowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [giftToEdit, setGiftToEdit] = useState<GiftItem | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Caricamento iniziale & Controllo Reset Link (?reset=1)
  useEffect(() => {
    // Controllo sblocco da link magico Admin (es: ?reset=1)
    const urlParams = new URLSearchParams(window.location.search);
    const hasResetParam = urlParams.get('reset') === '1' || urlParams.get('reset') === 'true';

    if (hasResetParam) {
      localStorage.removeItem(CURRENT_USER_KEY);
      // Pulisce l'URL senza ricaricare la pagina
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadInitialData().then(({ members, gifts }) => {
      setMembers(members);
      setGifts(gifts);

      const savedUser = hasResetParam ? null : localStorage.getItem(CURRENT_USER_KEY);

      if (savedUser && members.some((m) => m.id === savedUser)) {
        setCurrentUserId(savedUser);
        setSelectedMemberId(savedUser);
        setIsWhoAreYouOpen(false);
      } else {
        // Nessun utente memorizzato o reset richiesto: mostra "Chi sei?"
        setIsWhoAreYouOpen(true);
        setSelectedMemberId('all');
      }

      setIsLoading(false);
    });
  }, []);

  // Selezione permanente e definitiva di chi sei
  const handleSelectUserIdentity = (member: FamilyMember) => {
    setCurrentUserId(member.id);
    localStorage.setItem(CURRENT_USER_KEY, member.id);
    setSelectedMemberId(member.id);
    setActiveMemberId(member.id);
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

  // Salva aggiornamenti profilo membro (emoji, banner, bio)
  const handleSaveProfile = async (updated: FamilyMember) => {
    await saveMember(updated);
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Elimina membro (solo da pannello famiglia)
  const handleDeleteMember = async (id: string) => {
    if (id === currentUserId) {
      alert('Non puoi eliminare il tuo stesso profilo.');
      return;
    }
    await removeMemberStorage(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setGifts((prev) => prev.filter((g) => g.memberId !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId('all');
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
    // Non puoi prenotare i tuoi stessi regali!
    if (gift.memberId === currentUserId) {
      alert("Non puoi prenotare i tuoi stessi regali! Lascia che ci pensi la famiglia 🎅🎁");
      return;
    }

    const currentUserObj = members.find((m) => m.id === currentUserId);
    if (!currentUserObj) {
      setIsWhoAreYouOpen(true);
      return;
    }

    let buyerName: string | null = null;
    if (!gift.reservedBy) {
      buyerName = currentUserObj.name;
    } else {
      const confirmRemove = confirm(`Vuoi rimuovere la prenotazione "Preso da ${gift.reservedBy}"?`);
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

  // Funzioni ESCLUSIVE Admin Leo
  const handleResetThisDevice = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUserId(null);
    setSelectedMemberId('all');
    setIsAdminPanelOpen(false);
    setIsWhoAreYouOpen(true);
  };

  const handleClearAllGifts = async () => {
    for (const g of gifts) {
      await removeGiftStorage(g.id);
    }
    setGifts([]);
    setIsAdminPanelOpen(false);
  };

  const handleUnlockGiftReserve = async (giftId: string) => {
    const target = gifts.find((g) => g.id === giftId);
    if (!target) return;
    const updated: GiftItem = {
      ...target,
      reservedBy: null,
    };
    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === giftId ? updated : g)));
  };

  const handleResetDatabaseFactory = async () => {
    for (const g of gifts) {
      await removeGiftStorage(g.id);
    }
    setGifts([]);
    for (const m of OFFICIAL_FAMILY_MEMBERS) {
      await saveMember(m);
    }
    setMembers(OFFICIAL_FAMILY_MEMBERS);
    setIsAdminPanelOpen(false);
    alert('Database ripristinato ai 10 membri ufficiali di famiglia.');
  };

  // Filtra regali
  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      if (selectedMemberId !== 'all' && gift.memberId !== selectedMemberId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = gift.title.toLowerCase().includes(q);
        const matchDesc = gift.description?.toLowerCase().includes(q) ?? false;
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [gifts, selectedMemberId, searchQuery]);

  // Membro correntemente visualizzato
  const currentMember = useMemo(() => {
    if (selectedMemberId === 'all') return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Utente loggato fisso
  const loggedUser = useMemo(() => {
    return members.find((m) => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  // È Leo l'admin del sito?
  const isLeoAdmin = useMemo(() => {
    if (!loggedUser) return false;
    return loggedUser.id === 'leo' || loggedUser.name.trim().toLowerCase() === 'leo';
  }, [loggedUser]);

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
        currentMember={currentMember || loggedUser || members[0] || null}
        currentUser={loggedUser}
        isAdmin={isLeoAdmin}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onOpenEditProfile={() => {
          if (loggedUser) openEditProfileFor(loggedUser);
        }}
        onOpenAddModal={() => {
          setGiftToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        snowing={snowing}
        toggleSnow={() => setSnowing(!snowing)}
        totalGiftsCount={gifts.length}
      />

      {/* Contenuto Principale */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full space-y-5 pb-24 sm:pb-10">
        {/* Banner Natalizio Personalizzato */}
        <section
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${activeBannerTheme.gradientClass} text-white p-5 sm:p-8 shadow-lg shadow-black/10 transition-all duration-500`}
        >
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-36 sm:w-48 h-36 sm:h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 sm:space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-white/95 border border-white/20">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                {currentMember ? (
                  <span>Lista Desideri di {currentMember.name} {currentMember.avatar}</span>
                ) : loggedUser ? (
                  <span>Ciao, {loggedUser.name}! {loggedUser.avatar} {isLeoAdmin && '👑'}</span>
                ) : (
                  <span>Natale in Famiglia</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentMember && (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl sm:text-4xl shadow-md shrink-0">
                    {currentMember.avatar}
                  </div>
                )}
                <div>
                  <h2 className="text-xl sm:text-3xl font-extrabold festive-font tracking-wide leading-tight">
                    {currentMember
                      ? `I Desideri di ${currentMember.name}`
                      : loggedUser
                      ? `${loggedUser.name}, cosa vorresti ricevere?`
                      : `Cosa vorresti trovare sotto l'albero?`}
                  </h2>
                  {currentMember?.bio && (
                    <p className="text-xs sm:text-sm text-white/90 italic mt-0.5 font-serif">
                      "{currentMember.bio}"
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                {currentMember
                  ? `Ecco cosa vorrebbe ricevere ${currentMember.name} per Natale. Puoi aggiungere un link o segnare cosa comprerai per evitare doppioni!`
                  : `Guarda i desideri della famiglia e aggiungi i regali che vorresti ricevere per Natale!`}
              </p>
            </div>

            {/* Azioni Banner */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-red-600 stroke-[3]" />
                <span>Aggiungi Regalo</span>
              </button>

              {/* Personalizza il profilo dell'utente loggato */}
              {loggedUser && (
                <button
                  onClick={() => openEditProfileFor(loggedUser)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center justify-center gap-1.5"
                  title="Modifica colore del banner, la tua emoji e il motto"
                >
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  <span>Personalizza</span>
                </button>
              )}

              {/* Pulsante Admin ESCLUSIVO per Leo nel banner */}
              {isLeoAdmin && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-100" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Selettore Membri / Famiglia */}
        <MemberSelector
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={handleSelectMember}
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
              {currentMember?.avatar || loggedUser?.avatar || '🎅'}
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
            {loggedUser && (
              <>
                <button
                  onClick={() => openEditProfileFor(loggedUser)}
                  className="hover:text-red-600 transition-colors font-semibold text-slate-700"
                >
                  Personalizza ({loggedUser.name})
                </button>
                <span>•</span>
              </>
            )}
            {isLeoAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="hover:text-amber-600 text-amber-700 font-bold transition-colors flex items-center gap-1"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Pannello Admin</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Schermata Iniziale Obbligatoria "Chi sei?" */}
      <WhoAreYouModal
        isOpen={isWhoAreYouOpen}
        members={members}
        onSelectUser={handleSelectUserIdentity}
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

      {/* Pannello Admin Esclusivo per Leo */}
      {isLeoAdmin && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          members={members}
          gifts={gifts}
          onResetThisDevice={handleResetThisDevice}
          onClearAllGifts={handleClearAllGifts}
          onUnlockGiftReserve={handleUnlockGiftReserve}
          onResetDatabaseFactory={handleResetDatabaseFactory}
        />
      )}

      {/* Modale Aggiungi / Modifica Regalo */}
      <AddGiftModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setGiftToEdit(null);
        }}
        onSave={handleSaveGift}
        initialMemberId={
          currentUserId && members.some((m) => m.id === currentUserId)
            ? currentUserId
            : selectedMemberId === 'all'
            ? (members[0]?.id ?? '')
            : selectedMemberId
        }
        giftToEdit={giftToEdit}
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
