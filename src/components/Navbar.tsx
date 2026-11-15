import React from 'react';
import { Menu, Plus, Download, Gift } from 'lucide-react';
import { FamilyMember } from '../types';

interface NavbarProps {
  currentMember: FamilyMember | null;
  currentUser: FamilyMember | null;
  onOpenSidebar: () => void;
  onOpenAddModal: () => void;
  onInstallApp: () => void;
  isAppInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMember,
  currentUser,
  onOpenSidebar,
  onOpenAddModal,
  onInstallApp,
  isAppInstalled = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-400 via-emerald-500 to-rose-600" />

      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Sinistra: Pulsante Menu Laterale + Titolo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
              aria-label="Apri menu laterale"
            >
              <Menu className="w-4 h-4 text-slate-700" />
              <span>Menu</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 hidden xs:flex sm:flex">
                <Gift className="w-4 h-4" />
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 festive-font truncate">
                Lista Natale
              </h1>
            </div>
          </div>

          {/* Destra: Scarica App + Utente + Aggiungi Regalo */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isAppInstalled && (
              <button
                type="button"
                onClick={onInstallApp}
                title="Scarica Web App"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Scarica App</span>
              </button>
            )}

            {currentUser && (
              <button
                type="button"
                onClick={onOpenSidebar}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <span>{currentUser.avatar}</span>
                <span className="max-w-[90px] truncate">{currentUser.name}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              disabled={!currentMember}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Aggiungi</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
