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
import { SnowEffect } from './components/SnowEffect';
import {
  Plus,
  Search,
  Sparkles,
  Palette,
  Crown,
  HelpCircle,
  EyeOff,
  CheckCircle2,
  Gift,
  X,
  ArrowRight,
} from 'lucide-react';

const CURRENT_USER_KEY = 'natale_logged_user_id';
const HIDE_INLINE_GUIDE_KEY = 'natale_hide_inline_guide';

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
  const [showInlineGuide, setShowInlineGuide] = useState(() => {
    return localStorage.getItem(HIDE_INLINE_GUIDE_KEY) !== 'true';
  });
  const [profileToEdit, setProfileToEdit] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snowing, setSnowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

  // Modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [giftToEdit, setGiftToEdit] = useState<GiftItem | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

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

  const handleDismissInlineGuide = () => {
    setShowInlineGuide(false);
    localStorage.setItem(HIDE_INLINE_GUIDE_KEY, 'true');
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

      // Filtro disponibilità (solo sui regali degli altri per non spoilerare mai i propri!)
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
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center text-4xl shadow-2xl shadow-red-600/30 animate-bounce">
          🎄
        </div>
        <h2 className="mt-5 text-xl font-extrabold festive-font text-slate-900">
          Prepariamo l'albero di Natale...
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sincronizzazione dei desideri della famiglia in corso
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800 relative selection:bg-red-200">
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
        onOpenGuide={() => setIsGuideOpen(true)}
        snowing={snowing}
        toggleSnow={() => setSnowing(!snowing)}
        totalGiftsCount={gifts.length}
      />

      {/* Contenuto Principale */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 flex-1 w-full space-y-6 pb-28 sm:pb-12 relative z-10">
        {/* 1. Guida Veloce Autoesplicativa in 3 Passi (Richiudibile) */}
        {showInlineGuide && (
          <section className="relative bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-md shadow-amber-900/5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Come funziona in 3 semplici passi</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <span>Guida completa</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDismissInlineGuide}
                  title="Nascondi questo riquadro"
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/60 border border-red-100">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Scrivi cosa desideri ✍️
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Vai sulla tua scheda <strong>"Tu"</strong> e premi <strong>"+ Aggiungi Desiderio"</strong>. Inserisci nome, foto o link!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Prenota con "Ci penso io!" 🎁
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Tocca il nome di un parente e, se vuoi comprargli un regalo, premi <strong>"Ci penso io!"</strong> per evitare doppioni.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                  🤫
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Effetto Sorpresa Protetto!
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Chi riceve il regalo <strong>non vedrà mai</strong> se il suo desiderio è stato prenotato. Lo vedono solo gli altri parenti!
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Selettore Membri / Famiglia (Subito accessibile e chiarissimo) */}
        <MemberSelector
          members={members}
          selectedMemberId={selectedMemberId}
          currentUserId={currentUserId}
          onSelectMember={handleSelectMember}
          giftCounts={giftCounts}
        />

        {/* 3. Hero Banner Contestuale (Spiega sempre cosa stai guardando) */}
        <section
          className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${activeBannerTheme.gradientClass} text-white p-5 sm:p-8 shadow-xl shadow-black/10 transition-all duration-500`}
        >
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              {/* Pillola stato */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isViewingMyOwnList ? (
                  <span>La tua lista personale dei desideri</span>
                ) : currentMember ? (
                  <span>Stai guardando la lista di {currentMember.name}</span>
                ) : (
                  <span>Panoramica di tutta la famiglia</span>
                )}
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0">
                  {currentMember ? currentMember.avatar : loggedUser?.avatar || '🎄'}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold festive-font tracking-wide leading-tight">
                    {isViewingMyOwnList
                      ? `I tuoi desideri, ${currentMember?.name}`
                      : currentMember
                      ? `Cosa desidera ${currentMember.name}`
                      : `Tutti i desideri sotto l'albero`}
                  </h2>
                  {currentMember?.bio ? (
                    <p className="text-xs sm:text-sm text-white/90 italic mt-1 font-serif">
                      "{currentMember.bio}"
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-white/85 mt-1">
                      {isViewingMyOwnList
                        ? 'Aggiungi qui ciò che ti piacerebbe ricevere a Natale!'
                        : currentMember
                        ? `Scegli un regalo per ${currentMember.name} e premi "Ci penso io!" per prenotarlo.`
                        : 'Esplora le idee regalo di tutti i familiari o filtra quelli ancora liberi.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Box Autoesplicativo Contestuale dentro il Banner */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 text-xs text-white/95">
                {isViewingMyOwnList ? (
                  <>
                    <EyeOff className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      <strong>Effetto sorpresa attivo:</strong> i parenti vedono i tuoi regali, ma tu non vedrai chi li prenota!
                    </span>
                  </>
                ) : currentMember ? (
                  <>
                    <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      Se prenoti un regalo con <strong>"Ci penso io!"</strong>, gli altri parenti lo sapranno ma <strong>{currentMember.name} non vedrà nulla!</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      Tocca un nome qui sopra per vedere i desideri di una singola persona.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Azioni Banner */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-white hover:bg-red-50 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-red-600 stroke-[3]" />
                <span>Aggiungi mio desiderio</span>
              </button>

              {loggedUser && (
                <button
                  onClick={() => openEditProfileFor(loggedUser)}
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Palette className="w-4 h-4 text-amber-300" />
                  <span>Personalizza profilo</span>
                </button>
              )}

              {isLeoAdmin && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Crown className="w-4 h-4 text-yellow-100" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 4. Barra Filtri e Ricerca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtri rapidi disponibilità (visibili quando si guardano i regali degli altri) */}
            {!isViewingMyOwnList ? (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setAvailabilityFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    availabilityFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tutti ({filteredGifts.length})
                </button>
                <button
                  onClick={() => setAvailabilityFilter('available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    availabilityFilter === 'available'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🟢</span>
                  <span>Ancora liberi</span>
                </button>
                <button
                  onClick={() => setAvailabilityFilter('reserved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    availabilityFilter === 'reserved'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🎀</span>
                  <span>Già prenotati</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2">
                <span className="text-sm font-extrabold text-slate-800">
                  I tuoi desideri inseriti ({filteredGifts.length})
                </span>
              </div>
            )}
          </div>

          {/* Input di Ricerca */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca un regalo per nome..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 5. Griglia dei Regali */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
          /* Stato Vuoto Chiaro e Invitante */
          <div className="text-center py-14 px-5 bg-white/90 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-red-200 shadow-xs max-w-xl mx-auto my-4 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
              {currentMember?.avatar || loggedUser?.avatar || '🎅'}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 festive-font">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Nessun regalo trovato con questi filtri'
                  : isViewingMyOwnList
                  ? 'Non hai ancora scritto nessun desiderio!'
                  : currentMember
                  ? `${currentMember.name} non ha ancora aggiunto desideri`
                  : 'La lista dei regali è ancora vuota'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery || availabilityFilter !== 'all'
                  ? 'Prova a mostrare tutti i regali o a cancellare il testo nella barra di ricerca.'
                  : isViewingMyOwnList
                  ? 'Aiuta la famiglia a farti il regalo perfetto! Premi il pulsante qui sotto per aggiungere il tuo primo desiderio.'
                  : `Non appena ${currentMember?.name || 'qualcuno'} aggiungerà un regalo, apparirà automaticamente qui!`}
              </p>
            </div>

            {searchQuery || availabilityFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAvailabilityFilter('all');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all"
              >
                Mostra tutti i regali
              </button>
            ) : (
              <button
                onClick={() => {
                  setGiftToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-xs sm:text-sm font-extrabold shadow-lg shadow-red-600/25 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Aggiungi un tuo desiderio</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-red-100 bg-white/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center font-medium">
            <span>🎄 Lista Regali di Natale in Famiglia</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Sincronizzata in Cloud</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-red-600 font-bold text-slate-700 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Guida: Come funziona</span>
            </button>
            {loggedUser && (
              <>
                <span>•</span>
                <button
                  onClick={() => openEditProfileFor(loggedUser)}
                  className="hover:text-red-600 transition-colors font-bold text-slate-700"
                >
                  Personalizza ({loggedUser.name})
                </button>
              </>
            )}
            {isLeoAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="hover:text-amber-600 text-amber-700 font-extrabold transition-colors flex items-center gap-1"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pannello Admin</span>
                </button>
              </>
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
