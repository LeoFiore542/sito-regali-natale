import React, { useMemo } from 'react';
import { Gift, Plus, Sparkles, Palette, Crown, HelpCircle } from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenEditProfile: () => void;
  onOpenAddModal: () => void;
  onOpenGuide: () => void;
  snowing: boolean;
  toggleSnow: () => void;
  totalGiftsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  currentUser,
  isAdmin = false,
  onOpenAdmin,
  onOpenEditProfile,
  onOpenAddModal,
  onOpenGuide,
  snowing,
  toggleSnow,
}) => {
  // Calcolo giorni mancanti a Natale (25 Dicembre)
  const daysToChristmas = useMemo(() => {
    const now = new Date();
    const year = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
    const xmas = new Date(year, 11, 25);
    const diff = Math.ceil((xmas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-red-100/80 shadow-xs">
        {/* Filo decorativo natalizio superiore */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-400 via-emerald-500 to-rose-600" />

        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo e Titolo */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-600/25 shrink-0 ring-2 ring-red-100">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 text-xs">✨</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 festive-font truncate">
                    Natale in Famiglia
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <span>🎄</span>
                    <span>
                      {daysToChristmas === 0
                        ? 'È Natale!'
                        : `-${daysToChristmas} giorni a Natale`}
                    </span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  Lista dei desideri condivisa • <span className="text-emerald-700 font-semibold">Live</span>
                </p>
              </div>
            </div>

            {/* Azioni Navbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Pulsante Guida "Come funziona" ben visibile */}
              <button
                onClick={onOpenGuide}
                title="Scopri come funziona l'app"
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/90 text-xs font-bold transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Come funziona</span>
              </button>

              {/* Profilo Utente & Personalizza */}
              {currentUser && (
                <button
                  onClick={onOpenEditProfile}
                  title="Personalizza la tua emoji, colore e motto"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 text-xs font-bold transition-all active:scale-95"
                >
                  <span className="text-base leading-none">{currentUser.avatar}</span>
                  <span className="max-w-[68px] sm:max-w-[110px] truncate">{currentUser.name}</span>
                  <Palette className="w-3.5 h-3.5 text-rose-500 hidden sm:inline shrink-0" />
                </button>
              )}

              {/* Pulsante Admin Leo (se Leo) */}
              {isAdmin && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title="Pannello Admin di Leo"
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Admin</span>
                </button>
              )}

              {/* Toggle Fiocchi di Neve */}
              <button
                onClick={toggleSnow}
                title={snowing ? 'Disattiva effetto neve' : 'Attiva effetto neve'}
                className={`p-2 rounded-xl border transition-all ${
                  snowing
                    ? 'bg-sky-50 border-sky-200 text-sky-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Bottone Aggiungi Desiderio (Desktop) */}
              <button
                onClick={onOpenAddModal}
                disabled={!currentMember}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold shadow-md shadow-red-600/20 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all text-xs sm:text-sm active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Aggiungi Desiderio</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barra Flottante Mobile (Thumb-Friendly) */}
      <div className="fixed sm:hidden bottom-4 inset-x-4 z-40 pointer-events-none flex items-center justify-end">
        <button
          onClick={onOpenAddModal}
          disabled={!currentMember}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-extrabold text-sm bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-xl shadow-red-950/30 active:scale-95 transition-transform ring-2 ring-white"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Aggiungi mio desiderio</span>
        </button>
      </div>
    </>
  );
};
