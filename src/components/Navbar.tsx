import React from 'react';
import { Gift, Plus, Sparkles, Users, Palette, Crown } from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenEditProfile: () => void;
  onOpenAddModal: () => void;
  onOpenMembersModal: () => void;
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
  onOpenMembersModal,
  snowing,
  toggleSnow,
  totalGiftsCount,
}) => {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo e Titolo */}
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-200 shrink-0">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 festive-font truncate flex items-center gap-1">
                    <span>Lista di Natale</span>
                    <span className="text-red-600 text-sm sm:text-base">🎄</span>
                  </h1>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shrink-0">
                    {totalGiftsCount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden md:block">
                  I desideri di tutta la famiglia
                </p>
              </div>
            </div>

            {/* Azioni Navbar */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              {/* Badge Admin Leo (se Admin) */}
              {isAdmin && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title="Pannello Amministrazione (Solo Leo)"
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Profilo & Personalizza (Tap diretto per personalizzare) */}
              {currentUser && (
                <button
                  onClick={onOpenEditProfile}
                  title="Tocca per personalizzare emoji, banner e motto"
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-semibold hover:bg-rose-100 transition-colors"
                >
                  <span className="text-sm sm:text-base">{currentUser.avatar}</span>
                  <span className="max-w-[70px] sm:max-w-none truncate">{currentUser.name}</span>
                  <Palette className="w-3 h-3 text-rose-500 hidden sm:inline" />
                </button>
              )}

              {/* Toggle Fiocchi di Neve */}
              <button
                onClick={toggleSnow}
                title={snowing ? 'Disattiva neve' : 'Attiva neve'}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                  snowing
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Membri Famiglia (visibile sempre con icona) */}
              <button
                onClick={onOpenMembersModal}
                title="Vedi membri della famiglia"
                className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 text-xs font-medium transition-colors"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span className="hidden sm:inline">Famiglia</span>
              </button>

              {/* Bottone Aggiungi Regalo (Desktop) */}
              <button
                onClick={onOpenAddModal}
                disabled={!currentMember}
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-white font-medium shadow-md shadow-red-200 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all text-xs sm:text-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Regalo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Button fisso in basso a destra su Mobile per aggiungere regali con il pollice */}
      <div className="fixed sm:hidden bottom-5 right-4 z-40">
        <button
          onClick={onOpenAddModal}
          disabled={!currentMember}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 shadow-xl shadow-red-900/30 active:scale-90 transition-transform border-2 border-white"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Nuovo Regalo</span>
        </button>
      </div>
    </>
  );
};
