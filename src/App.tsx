import React, { useState, useEffect, useMemo } from 'react';
import { FamilyMember, GiftItem } from './types';
import {
  loadInitialData,
  subscribeToGifts,
  subscribeToMembers,
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
import { HowItWorksModal } from './components/HowItWorksModal';
import { InstallAppModal } from './components/InstallAppModal';
import { SnowEffect } from './components/SnowEffect';
import {
  Plus,
  Search,
  Palette,
  Crown,
  HelpCircle,
  EyeOff,
  Gift,
  X,
} from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';

type AvailabilityFilter = 'all' | 'available' | 'reserved';

export const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWhoAreYouOpen, setIsWhoAreYouOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snowing, setSnowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

  // Modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [giftToEdit, setGiftToEdit] = useState<GiftItem | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(() => {
    return (window as any).__deferredPwaPrompt || null;
  });
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });

  // Gestione evento di installazione Web App (PWA)
  useEffect(() => {
    const syncGlobalPrompt = () => {
      if ((window as any).__deferredPwaPrompt) {
        setDeferredPwaPrompt((window as any).__deferredPwaPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredPwaPrompt = e;
      setDeferredPwaPrompt(e);
    };

    const handleAppInstalled = () => {
      (window as any).__deferredPwaPrompt = null;
      setDeferredPwaPrompt(null);
      setIsAppInstalled(true);
      setIsInstallModalOpen(false);
    };

    syncGlobalPrompt();
    window.addEventListener('pwa-prompt-ready', syncGlobalPrompt);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', syncGlobalPrompt);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerNativePwaInstall = async () => {
    if (!deferredPwaPrompt) return;
    try {
      await deferredPwaPrompt.prompt();
      const choice = await deferredPwaPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        (window as any).__deferredPwaPrompt = null;
        setDeferredPwaPrompt(null);
      }
    } catch (err) {
      console.warn('Errore prompt installazione:', err);
    }
  };

  const handleInstallAppClick = async () => {
    if (deferredPwaPrompt) {
      await triggerNativePwaInstall();
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Caricamento iniziale & Controllo Reset Link (?reset=1)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasResetParam = urlParams.get('reset') === '1' || urlParams.get('reset') === 'true';

    if (hasResetParam) {
      localStorage.removeItem(CURRENT_USER_KEY);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadInitialData().then(({ members: initialMembers, gifts: initialGifts }) => {
      setMembers(initialMembers);
      setGifts(initialGifts);

      const savedUser = hasResetParam ? null : localStorage.getItem(CURRENT_USER_KEY);

      if (savedUser && initialMembers.some((m) => m.id === savedUser)) {
        setCurrentUserId(savedUser);
        setSelectedMemberId(savedUser);
        setIsWhoAreYouOpen(false);
      } else {
        setIsWhoAreYouOpen(true);
        setSelectedMemberId('all');
      }

      setIsLoading(false);
    });

    const unsubGifts = subscribeToGifts((updatedGifts) => {
      setGifts(updatedGifts);
      setIsLoading(false);
    });

    const unsubMembers = subscribeToMembers((updatedMembers) => {
      setMembers(updatedMembers);
    });

    return () => {
      unsubGifts();
      unsubMembers();
    };
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
    setAvailabilityFilter('all');
    setActiveMemberId(id === 'all' ? null : id);
  };

  // Conteggio regali per membro (con deduplicazione sicura)
  const giftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const seen = new Set<string>();
    gifts.forEach((g) => {
      if (!seen.has(g.id)) {
        seen.add(g.id);
        counts[g.memberId] = (counts[g.memberId] || 0) + 1;
      }
    });
    return counts;
  }, [gifts]);

  // Salva aggiornamenti profilo membro (emoji, banner, bio)
  const handleSaveProfile = async (updated: FamilyMember) => {
    await saveMember(updated);
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Elimina membro
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
      setGifts((prev) => {
        if (prev.some((g) => g.id === newGift.id)) return prev;
        return [newGift, ...prev];
      });
    }
  };

  // Elimina regalo
  const handleDeleteGift = async (id: string) => {
    await removeGiftStorage(id);
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  // Toggle "Prenotato / Ci penso io"
  const handleToggleReserve = async (gift: GiftItem) => {
    if (gift.memberId === currentUserId) {
      alert('Non puoi prenotare i tuoi stessi regali! Lascia che ci pensi la famiglia 🎅🎁');
      return;
    }

    const activeUser = members.find((m) => m.id === currentUserId);

    if (gift.reservedBy) {
      const updated: GiftItem = { ...gift, reservedBy: null };
      await saveGift(updated);
      setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
    } else {
      const reserverName = activeUser?.name || 'Un familiare';
      const updated: GiftItem = { ...gift, reservedBy: reserverName };
      await saveGift(updated);
      setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
    }
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

  // Membro correntemente visualizzato
  const currentMember = useMemo(() => {
    if (selectedMemberId === 'all') return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Utente loggato fisso
  const loggedUser = useMemo(() => {
    return members.find((m) => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  // Sto guardando la MIA lista personale?
  const isViewingMyOwnList = Boolean(
    currentMember && currentUserId && currentMember.id === currentUserId
  );

  // È Leo l'admin del sito?
  const isLeoAdmin = useMemo(() => {
    if (!loggedUser) return false;
    return loggedUser.id === 'leo' || loggedUser.name.trim().toLowerCase() === 'leo';
  }, [loggedUser]);

  // Filtra regali (con deduplicazione sicura e protezione anti-spoiler sui propri regali)
  const filteredGifts = useMemo(() => {
    const seen = new Set<string>();
    return gifts.filter((gift) => {
      if (seen.has(gift.id)) return false;
      seen.add(gift.id);

      if (selectedMemberId !== 'all' && gift.memberId !== selectedMemberId) {
        return false;
      }

      if (!isViewingMyOwnList && availabilityFilter !== 'all') {
        const isMine = gift.memberId === currentUserId;
        const effectivelyReserved = !isMine && Boolean(gift.reservedBy);
        if (availabilityFilter === 'available' && effectivelyReserved) return false;
        if (availabilityFilter === 'reserved' && !effectivelyReserved) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = gift.title.toLowerCase().includes(q);
        const matchDesc = gift.description?.toLowerCase().includes(q) ?? false;
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [gifts, selectedMemberId, searchQuery, availabilityFilter, isViewingMyOwnList, currentUserId]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf8f3] text-slate-700 p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl shadow-lg animate-bounce">
          🎄
        </div>
        <h2 className="mt-4 text-lg font-extrabold festive-font text-slate-900">
          Caricamento regali...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800 relative selection:bg-red-200">
      {/* Effetto fiocchi di neve */}
      <SnowEffect active={snowing} />

      {/* Navbar Compatta */}
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
        onOpenGuide={() => setIsGuideOpen(true)}
        onInstallApp={handleInstallAppClick}
        isAppInstalled={isAppInstalled}
        snowing={snowing}
        toggleSnow={() => setSnowing(!snowing)}
        totalGiftsCount={gifts.length}
      />

      {/* Contenuto Principale Compatto e Diretto */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex-1 w-full space-y-3 sm:space-y-4 pb-24 sm:pb-10 relative z-10">
        {/* 1. Barra Orizzontale Compatta Membri Famiglia */}
        <MemberSelector
          members={members}
          selectedMemberId={selectedMemberId}
          currentUserId={currentUserId}
          onSelectMember={handleSelectMember}
          giftCounts={giftCounts}
        />

        {/* 2. Intestazione Contestuale Compatta (Senza occupare metà schermo) */}
        <section
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${activeBannerTheme.gradientClass} text-white px-4 py-3.5 sm:px-6 sm:py-4 shadow-sm transition-all duration-300`}
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shrink-0">
                {currentMember ? currentMember.avatar : loggedUser?.avatar || '🎄'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-extrabold festive-font tracking-wide truncate">
                  {isViewingMyOwnList
                    ? `La tua lista (${currentMember?.name})`
                    : currentMember
                    ? `Desideri di ${currentMember.name}`
                    : `Tutti i desideri in famiglia`}
                </h2>
                <p className="text-[11px] sm:text-xs text-white/90 flex items-center gap-1 truncate mt-0.5">
                  {isViewingMyOwnList ? (
                    <>
                      <EyeOff className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">Non vedi chi prenota i tuoi regali 🤫</span>
                    </>
                  ) : currentMember ? (
                    <>
                      <Gift className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">
                        Premi "Ci penso io!" per prenotare ({currentMember.name} non lo saprà)
                      </span>
                    </>
                  ) : (
                    <span className="truncate">
                      Tocca una persona sopra per filtrare la sua lista
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Azione rapida destra */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isViewingMyOwnList && loggedUser ? (
                <button
                  onClick={() => openEditProfileFor(loggedUser)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-1 transition-all"
                  title="Cambia colore ed emoji"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Tema</span>
                </button>
              ) : null}

              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-red-50 text-slate-900 font-extrabold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Barra Compatta Filtri + Ricerca su una sola riga */}
        <div className="flex items-center justify-between gap-2">
          {/* Filtri disponibilità (quando guardi gli altri) */}
          {!isViewingMyOwnList ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  availabilityFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tutti ({filteredGifts.length})
              </button>
              <button
                onClick={() => setAvailabilityFilter('available')}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  availabilityFilter === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Liberi
              </button>
              <button
                onClick={() => setAvailabilityFilter('reserved')}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  availabilityFilter === 'reserved'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presi
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-600 px-1 shrink-0">
              {filteredGifts.length} {filteredGifts.length === 1 ? 'desiderio' : 'desideri'}
            </span>
          )}

          {/* Input di Ricerca compatto */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca regalo..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200/90 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Lista dei Regali Compatta (1 colonna su mobile, 2 su tablet/desktop) */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
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
                  currentUserName={loggedUser?.name}
                />
              );
            })}
          </div>
        ) : (
          /* Stato Vuoto Compatto */
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-md mx-auto my-2 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
              {currentMember?.avatar || loggedUser?.avatar || '🎅'}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 festive-font">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Nessun regalo trovato'
                  : isViewingMyOwnList
                  ? 'La tua lista è ancora vuota'
                  : currentMember
                  ? `${currentMember.name} non ha ancora inserito desideri`
                  : 'Nessun desiderio ancora inserito'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Prova a rimuovere i filtri di ricerca.'
                  : isViewingMyOwnList
                  ? 'Aggiungi il tuo primo desiderio per aiutare la famiglia!'
                  : 'Appena verrà aggiunto un regalo comparirà qui.'}
              </p>
            </div>

            {searchQuery || availabilityFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Mostra tutti
              </button>
            ) : (
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Aggiungi mio desiderio</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer Compatto */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-4 text-center text-[11px] text-slate-500 relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>🎄 Lista Regali di Famiglia</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-red-600 font-bold text-slate-700 flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-amber-600" />
              <span>Come funziona</span>
            </button>
            {isLeoAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="text-amber-700 font-bold flex items-center gap-1"
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Admin</span>
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

      {/* Modale Guida "Come funziona" */}
      <HowItWorksModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        userName={loggedUser?.name}
      />

      {/* Modale Scarica Web App (PWA) */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canInstallNative={Boolean(deferredPwaPrompt)}
        onTriggerNativeInstall={triggerNativePwaInstall}
        isAlreadyInstalled={isAppInstalled}
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
