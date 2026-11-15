import React from 'react';
import { Gift, Plus, Sparkles, Share2, Users, UserCheck, Palette } from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  onOpenWhoAreYou: () => void;
  onOpenEditProfile: () => void;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenMembersModal: () => void;
  snowing: boolean;
  toggleSnow: () => void;
  totalGiftsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  currentUser,
  onOpenWhoAreYou,
  onOpenEditProfile,
  onOpenAddModal,
  onOpenBackupModal,
  onOpenMembersModal,
  snowing,
  toggleSnow,
  totalGiftsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-red-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo e Titolo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 festive-font flex items-center gap-1.5">
                  Lista di Natale
                  <span className="text-red-600">🎄</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  {totalGiftsCount} {totalGiftsCount === 1 ? 'desiderio' : 'desideri'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Condividi i desideri con tutta la famiglia
              </p>
            </div>
          </div>

          {/* Azioni Principali */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Profilo "Chi sei?" & Personalizza */}
            {currentUser ? (
              <div className="flex items-center bg-rose-50 border border-rose-200/80 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={onOpenWhoAreYou}
                  title="Cambia membro della famiglia"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-900 hover:text-red-700 transition-colors"
                >
                  <span className="text-base">{currentUser.avatar}</span>
                  <span className="hidden sm:inline">{currentUser.name}</span>
                </button>
                <div className="w-px h-4 bg-rose-200 mx-0.5" />
                <button
                  onClick={onOpenEditProfile}
                  title="Personalizza emoji, colore banner e motto"
                  className="p-1 sm:px-2 sm:py-1 rounded-xl text-rose-700 hover:bg-rose-100/70 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Personalizza</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenWhoAreYou}
                title="Seleziona chi sei"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse transition-all"
              >
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Chi sei?</span>
              </button>
            )}

            {/* Toggle Fiocchi di Neve */}
            <button
              onClick={toggleSnow}
              title={snowing ? 'Disattiva fiocchi di neve' : 'Attiva fiocchi di neve'}
              className={`p-2 rounded-xl transition-colors border ${
                snowing
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Gestisci Membri Famiglia */}
            <button
              onClick={onOpenMembersModal}
              title="Gestisci membri della famiglia"
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="hidden lg:inline">Membri</span>
            </button>

            {/* Condivisione & Backup */}
            <button
              onClick={onOpenBackupModal}
              title="Condividi o salva lista"
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-600" />
              <span className="hidden lg:inline">Condividi</span>
            </button>

            {/* Bottone Aggiungi Regalo */}
            <button
              onClick={onOpenAddModal}
              disabled={!currentMember}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white font-medium shadow-md transition-all transform active:scale-95 text-xs sm:text-sm ${
                currentMember
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200 hover:shadow-lg'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Aggiungi Regalo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
