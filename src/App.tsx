import React, { useState, useEffect, useMemo } from 'react';
import {
  FamilyMember,
  GiftItem,
  ReservationMode,
  GiftParticipant,
  isUserRecipientOfGift,
  isUserInMemberOrGroup,
  getGroupMembers,
  getGiftParticipants,
  getEffectiveReservationMode,
  isUserParticipating,
} from './types';
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
import { SidebarDrawer } from './components/SidebarDrawer';
import { MemberSelector } from './components/MemberSelector';
import { GiftCard } from './components/GiftCard';
import { GiftDetailModal } from './components/GiftDetailModal';
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
  EyeOff,
  Gift,
  X,
  HelpCircle,
  Users,
} from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';

type AvailabilityFilter = 'all' | 'available' | 'split' | 'reserved';

export const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const [selectedGiftForDetail, setSelectedGiftForDetail] = useState<GiftItem | null>(null);
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

      if (savedUser && initialMembers.some((m) => !m.isGroup && m.id === savedUser)) {
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

  // Mantieni sincronizzato il regalo aperto nel popup dettagli quando arrivano aggiornamenti live
  const activeDetailGift = useMemo(() => {
    if (!selectedGiftForDetail) return null;
    return gifts.find((g) => g.id === selectedGiftForDetail.id) || null;
  }, [gifts, selectedGiftForDetail]);

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

  // Elimina membro o gruppo
  const handleDeleteMember = async (id: string) => {
    if (id === currentUserId) {
      alert('Non puoi eliminare il tuo stesso profilo.');
      return;
    }
    const giftsOfMember = gifts.filter((g) => g.memberId === id);
    for (const g of giftsOfMember) {
      await removeGiftStorage(g.id);
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

  // Prenota un regalo libero scegliendo tra "Da solo (chiuso)" o "Dividi la spesa (aperto)"
  const handleReserveGift = async (gift: GiftItem, mode: ReservationMode) => {
    if (isUserRecipientOfGift(currentUserId, gift, members)) {
      alert('Non puoi prenotare i tuoi stessi regali (o i regali del tuo gruppo)! Lascia che ci pensi la famiglia 🎅🎁');
      return;
    }

    const activeUser = members.find((m) => m.id === currentUserId);
    const participant: GiftParticipant = {
      memberId: activeUser?.id || '',
      name: activeUser?.name || 'Un familiare',
      avatar: activeUser?.avatar,
      joinedAt: Date.now(),
    };

    const updated: GiftItem = {
      ...gift,
      reservationMode: mode,
      participants: [participant],
      reservedBy: participant.name,
    };

    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
  };

  // Unisciti a un regalo già aperto per dividere la spesa
  const handleJoinSplitGift = async (gift: GiftItem) => {
    if (isUserRecipientOfGift(currentUserId, gift, members)) {
      alert('Non puoi partecipare ai tuoi stessi regali! 🎅🎁');
      return;
    }

    const mode = getEffectiveReservationMode(gift);
    if (mode === 'solo') return;

    const activeUser = members.find((m) => m.id === currentUserId);
    if (isUserParticipating(gift, currentUserId, activeUser?.name)) {
      return;
    }

    const existing = getGiftParticipants(gift);
    const newParticipant: GiftParticipant = {
      memberId: activeUser?.id || '',
      name: activeUser?.name || 'Un familiare',
      avatar: activeUser?.avatar,
      joinedAt: Date.now(),
    };

    const nextParticipants = [...existing, newParticipant];
    const updated: GiftItem = {
      ...gift,
      reservationMode: 'split',
      participants: nextParticipants,
      reservedBy: nextParticipants.map((p) => p.name).join(', '),
    };

    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
  };

  // Ritirati dalla prenotazione / divisione della spesa
  const handleLeaveGift = async (gift: GiftItem) => {
    const activeUser = members.find((m) => m.id === currentUserId);
    const existing = getGiftParticipants(gift);

    const remaining = existing.filter((p) => {
      if (currentUserId && p.memberId && p.memberId === currentUserId) return false;
      if (
        activeUser?.name &&
        p.name.trim().toLowerCase() === activeUser.name.trim().toLowerCase()
      ) {
        return false;
      }
      return true;
    });

    const updated: GiftItem =
      remaining.length === 0
        ? {
            ...gift,
            reservationMode: null,
            participants: [],
            reservedBy: null,
          }
        : {
            ...gift,
            reservationMode: 'split',
            participants: remaining,
            reservedBy: remaining.map((p) => p.name).join(', '),
          };

    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
  };

  // Cambia modalità tra "Ci penso io (da solo)" e "Insieme (aperto)"
  const handleSwitchReservationMode = async (gift: GiftItem, newMode: ReservationMode) => {
    const existing = getGiftParticipants(gift);
    const updated: GiftItem = {
      ...gift,
      reservationMode: newMode,
      participants: existing,
      reservedBy: existing.map((p) => p.name).join(', '),
    };
    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === gift.id ? updated : g)));
  };

  // Utente loggato fisso
  const loggedUser = useMemo(() => {
    return members.find((m) => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  // È Leo l'admin del sito?
  const isLeoAdmin = useMemo(() => {
    if (!loggedUser) return false;
    return loggedUser.id === 'leo' || loggedUser.name.trim().toLowerCase() === 'leo';
  }, [loggedUser]);

  // Funzioni ESCLUSIVE Admin Leo
  const handleCreateGroup = async (
    groupName: string,
    avatar: string,
    memberIds: string[]
  ) => {
    if (!isLeoAdmin || memberIds.length < 2) return;
    const newGroup: FamilyMember = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: groupName.trim(),
      avatar: avatar || '🎁',
      bannerTheme: 'royal-purple',
      isGroup: true,
      groupMemberIds: memberIds,
      createdAt: Date.now(),
    };
    await saveMember(newGroup);
    setMembers((prev) => [...prev, newGroup]);
  };

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
      reservationMode: null,
      participants: [],
    };
    await saveGift(updated);
    setGifts((prev) => prev.map((g) => (g.id === giftId ? updated : g)));
  };

  const handleResetDatabaseFactory = async () => {
    for (const g of gifts) {
      await removeGiftStorage(g.id);
    }
    setGifts([]);
    // Rimuove anche eventuali gruppi personalizzati creati
    const extraMembers = members.filter(
      (m) => !OFFICIAL_FAMILY_MEMBERS.some((off) => off.id === m.id)
    );
    for (const extra of extraMembers) {
      await removeMemberStorage(extra.id);
    }
    for (const m of OFFICIAL_FAMILY_MEMBERS) {
      await saveMember(m);
    }
    setMembers(OFFICIAL_FAMILY_MEMBERS);
    setSelectedMemberId('all');
    setIsAdminPanelOpen(false);
    alert('Database ripristinato ai 10 membri ufficiali di famiglia.');
  };

  // Membro o Gruppo correntemente visualizzato
  const currentMember = useMemo(() => {
    if (selectedMemberId === 'all') return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Sto guardando la MIA lista personale (o un gruppo di cui faccio parte)?
  const isViewingMyOwnList = useMemo(() => {
    return isUserInMemberOrGroup(currentUserId, currentMember);
  }, [currentUserId, currentMember]);

  // Filtra regali (con deduplicazione sicura e protezione anti-spoiler sui propri regali e gruppi)
  const filteredGifts = useMemo(() => {
    const seen = new Set<string>();
    return gifts.filter((gift) => {
      if (seen.has(gift.id)) return false;
      seen.add(gift.id);

      if (selectedMemberId !== 'all' && gift.memberId !== selectedMemberId) {
        return false;
      }

      if (!isViewingMyOwnList && availabilityFilter !== 'all') {
        const isMine = isUserRecipientOfGift(currentUserId, gift, members);
        const mode = isMine ? null : getEffectiveReservationMode(gift);
        if (availabilityFilter === 'available' && mode !== null) return false;
        if (availabilityFilter === 'split' && mode !== 'split') return false;
        if (availabilityFilter === 'reserved' && mode === null) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = gift.title.toLowerCase().includes(q);
        const matchDesc = gift.description?.toLowerCase().includes(q) ?? false;
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [
    gifts,
    selectedMemberId,
    searchQuery,
    availabilityFilter,
    isViewingMyOwnList,
    currentUserId,
    members,
  ]);

  // Tema del banner attivo
  const activeBannerTheme = useMemo(() => {
    if (currentMember) {
      return getBannerTheme(
        currentMember.bannerTheme || (currentMember.isGroup ? 'royal-purple' : undefined)
      );
    }
    if (loggedUser) {
      return getBannerTheme(loggedUser.bannerTheme);
    }
    return getBannerTheme('red-christmas');
  }, [currentMember, loggedUser]);

  const openEditProfileFor = (member: FamilyMember) => {
    setProfileToEdit(member);
    setIsEditProfileOpen(true);
  };

  // Determina la lista di default quando si clicca "+ Aggiungi"
  const defaultAddGiftMemberId = useMemo(() => {
    if (
      currentMember?.isGroup &&
      (isLeoAdmin || isUserInMemberOrGroup(currentUserId, currentMember))
    ) {
      return currentMember.id;
    }
    if (currentUserId && members.some((m) => m.id === currentUserId)) {
      return currentUserId;
    }
    return selectedMemberId === 'all' ? (members[0]?.id ?? '') : selectedMemberId;
  }, [currentMember, isLeoAdmin, currentUserId, members, selectedMemberId]);

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

  const currentGroupMembers = currentMember?.isGroup
    ? getGroupMembers(currentMember, members)
    : [];

  return (
    <div className="min-h-screen flex flex-col text-slate-800 relative selection:bg-red-200">
      {/* Effetto fiocchi di neve */}
      <SnowEffect active={snowing} />

      {/* Navbar Superiore con pulsante Menu Laterale */}
      <Navbar
        currentMember={currentMember || loggedUser || members[0] || null}
        currentUser={loggedUser}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAddModal={() => {
          setGiftToEdit(null);
          setIsAddModalOpen(true);
        }}
        onInstallApp={handleInstallAppClick}
        isAppInstalled={isAppInstalled}
      />

      {/* Menu Laterale con tutte le funzioni */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={loggedUser}
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={handleSelectMember}
        giftCounts={giftCounts}
        onOpenAddModal={() => {
          setGiftToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenEditProfile={() => {
          if (loggedUser) openEditProfileFor(loggedUser);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        onInstallApp={handleInstallAppClick}
        isAppInstalled={isAppInstalled}
        isAdmin={isLeoAdmin}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        snowing={snowing}
        toggleSnow={() => setSnowing(!snowing)}
      />

      {/* Contenuto Principale */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex-1 w-full space-y-3 relative z-10">
        {/* 1. Visualizzazione compatta di tutti i membri e gruppi della famiglia */}
        <MemberSelector
          members={members}
          selectedMemberId={selectedMemberId}
          currentUserId={currentUserId}
          onSelectMember={handleSelectMember}
          giftCounts={giftCounts}
        />

        {/* 2. Intestazione Compatta Lista Selezionata */}
        <section
          className={`rounded-2xl bg-gradient-to-r ${activeBannerTheme.gradientClass} text-white px-4 py-3 shadow-sm flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
              {currentMember ? currentMember.avatar : loggedUser?.avatar || '🎄'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold festive-font truncate">
                  {currentMember?.isGroup
                    ? `Regalo Condiviso: ${currentMember.name}`
                    : isViewingMyOwnList
                    ? `I tuoi desideri (${currentMember?.name})`
                    : currentMember
                    ? `Lista di ${currentMember.name}`
                    : `Tutti i regali della famiglia`}
                </h2>
                {currentMember?.isGroup && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                    Gruppo ({currentGroupMembers.map((m) => m.name).join(', ')})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/90 truncate flex items-center gap-1">
                {isViewingMyOwnList ? (
                  <>
                    <EyeOff className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>
                      {currentMember?.isGroup
                        ? 'Sorpresa protetta per tutto il gruppo: non vedete chi prenota'
                        : 'Sorpresa protetta: non vedi chi prenota'}
                    </span>
                  </>
                ) : (
                  <>
                    <Gift className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>
                      Prenota con "Ci penso io" oppure clicca "Insieme" per fare un regalo in gruppo
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline sm:inline">Guida</span>
          </button>
        </section>

        {/* 3. Barra Filtri e Ricerca */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {!isViewingMyOwnList ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  availabilityFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tutti ({filteredGifts.length})
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('available')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  availabilityFilter === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Liberi
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  availabilityFilter === 'split'
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Insieme</span>
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('reserved')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
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
              {filteredGifts.length} {filteredGifts.length === 1 ? 'elemento' : 'elementi'}
            </span>
          )}

          {/* Campo ricerca */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca in lista..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Visualizzazione in ELENCO degli elementi della lista */}
        {filteredGifts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredGifts.map((gift) => {
              const member = members.find((m) => m.id === gift.memberId);
              return (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  member={member}
                  allMembers={members}
                  showMemberBadge={selectedMemberId === 'all'}
                  onSelect={(g) => setSelectedGiftForDetail(g)}
                  onReserveGift={handleReserveGift}
                  onJoinSplitGift={handleJoinSplitGift}
                  currentUserId={currentUserId || undefined}
                  currentUserName={loggedUser?.name}
                />
              );
            })}
          </div>
        ) : (
          /* Stato Vuoto */
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
              {currentMember?.avatar || loggedUser?.avatar || '🎅'}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 festive-font">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Nessun regalo trovato'
                  : isViewingMyOwnList
                  ? currentMember?.isGroup
                    ? `La lista condivisa di ${currentMember.name} è ancora vuota`
                    : 'La tua lista è ancora vuota'
                  : currentMember
                  ? `${currentMember.name} non ha ancora inserito desideri`
                  : 'Nessun desiderio ancora inserito'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Prova a rimuovere i filtri di ricerca.'
                  : isViewingMyOwnList
                  ? 'Aggiungi il primo desiderio per aiutare la famiglia!'
                  : 'Appena verrà aggiunto un regalo comparirà in questo elenco.'}
              </p>
            </div>

            {searchQuery || availabilityFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Mostra tutti
              </button>
            ) : (
              (isViewingMyOwnList || isLeoAdmin || !currentMember) && (
                <button
                  type="button"
                  onClick={() => {
                    setGiftToEdit(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 text-xs font-bold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Aggiungi desiderio</span>
                </button>
              )
            )}
          </div>
        )}
      </main>

      {/* Scheda Popup per ulteriori dettagli (foto, descrizione e partecipazione) */}
      <GiftDetailModal
        gift={activeDetailGift}
        member={
          activeDetailGift
            ? members.find((m) => m.id === activeDetailGift.memberId)
            : undefined
        }
        allMembers={members}
        isOpen={Boolean(activeDetailGift)}
        onClose={() => setSelectedGiftForDetail(null)}
        onEdit={(g) => {
          setGiftToEdit(g);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteGift}
        onReserveGift={handleReserveGift}
        onJoinSplitGift={handleJoinSplitGift}
        onLeaveGift={handleLeaveGift}
        onSwitchReservationMode={handleSwitchReservationMode}
        currentUserId={currentUserId || undefined}
        currentUserName={loggedUser?.name}
      />

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
          onCreateGroup={handleCreateGroup}
          onDeleteGroup={handleDeleteMember}
          onSelectGroupList={(groupId) => handleSelectMember(groupId)}
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
        initialMemberId={defaultAddGiftMemberId}
        members={members}
        currentUserId={currentUserId}
        isAdmin={isLeoAdmin}
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
