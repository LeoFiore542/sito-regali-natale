import React from 'react';
import { Gift, Plus, Sparkles, Crown, HelpCircle, Download } from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenEditProfile: () => void;
  onOpenAddModal: () => void;
  onOpenGuide: () => void;
  onInstallApp: () => void;
  isAppInstalled?: boolean;
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
  onInstallApp,
  isAppInstalled = false,
  snowing,
  toggleSnow,
}) => {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80">
        <div className="h-0.5 w-full bg-gradient-to-r from-red-600 via-amber-400 via-emerald-500 to-rose-600" />

        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-13 sm:h-15 gap-2">
            {/* Logo compatto */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Gift className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 festive-font truncate">
                Lista Natale
              </h1>
            </div>

            {/* Azioni compatte in alto */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Pulsante Scarica App */}
              {!isAppInstalled && (
                <button
                  onClick={onInstallApp}
                  title="Scarica Web App"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Scarica App</span>
                </button>
              )}

              {/* Pulsante Guida */}
              <button
                onClick={onOpenGuide}
                title="Come funziona"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] sm:text-xs font-bold transition-all active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Guida</span>
              </button>

              {/* Profilo Utente */}
              {currentUser && (
                <button
                  onClick={onOpenEditProfile}
                  title="Personalizza il tuo profilo"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 text-[11px] sm:text-xs font-bold transition-all active:scale-95"
                >
                  <span className="text-sm leading-none">{currentUser.avatar}</span>
                  <span className="max-w-[55px] sm:max-w-[90px] truncate">{currentUser.name}</span>
                </button>
              )}

              {/* Admin (solo Leo) */}
              {isAdmin && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title="Pannello Admin Leo"
                  className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-transform active:scale-95 flex items-center gap-1"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Admin</span>
                </button>
              )}

              {/* Toggle Neve */}
              <button
                onClick={toggleSnow}
                title={snowing ? 'Disattiva neve' : 'Attiva neve'}
                className={`p-1.5 rounded-lg border transition-all hidden sm:flex ${
                  snowing
                    ? 'bg-sky-50 border-sky-200 text-sky-600'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Aggiungi Regalo (Desktop) */}
              <button
                onClick={onOpenAddModal}
                disabled={!currentMember}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-bold bg-red-600 hover:bg-red-700 transition-all text-xs active:scale-95 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pulsante Flottante Mobile Compatto */}
      <div className="fixed sm:hidden bottom-4 right-4 z-40">
        <button
          onClick={onOpenAddModal}
          disabled={!currentMember}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white font-bold text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-950/25 active:scale-95 transition-transform ring-2 ring-white"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuovo desiderio</span>
        </button>
      </div>
    </>
  );
};
