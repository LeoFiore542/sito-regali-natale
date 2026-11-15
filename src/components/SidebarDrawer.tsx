import React from 'react';
import { FamilyMember } from '../types';
import {
  X,
  Plus,
  Download,
  HelpCircle,
  Palette,
  Crown,
  Sparkles,
  Gift,
  Users,
  ChevronRight,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FamilyMember | null;
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onSelectMember: (id: string | 'all') => void;
  giftCounts: Record<string, number>;
  onOpenAddModal: () => void;
  onOpenEditProfile: () => void;
  onOpenGuide: () => void;
  onInstallApp: () => void;
  isAppInstalled: boolean;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  snowing: boolean;
  toggleSnow: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  members,
  selectedMemberId,
  onSelectMember,
  giftCounts,
  onOpenAddModal,
  onOpenEditProfile,
  onOpenGuide,
  onInstallApp,
  isAppInstalled,
  isAdmin,
  onOpenAdmin,
  snowing,
  toggleSnow,
}) => {
  if (!isOpen) return null;

  const totalGifts = Object.values(giftCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Sfondo scuro cliccabile per chiudere */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Pannello Laterale */}
      <aside className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Intestazione Menu Laterale con Profilo Utente */}
        <div className="bg-gradient-to-br from-red-700 via-rose-600 to-red-800 p-5 text-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Gift className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide festive-font">
                Natale in Famiglia
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
              aria-label="Chiudi menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {currentUser && (
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white text-2xl flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-100">
                    Il tuo profilo
                  </p>
                  <p className="text-sm font-extrabold truncate">{currentUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Modifica</span>
              </button>
            </div>
          )}
        </div>

        {/* Corpo Scorrevole con Tutte le Funzioni */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sezione 1: Azioni Principali */}
          <div className="space-y-1.5">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Azioni e Strumenti
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Aggiungi un tuo desiderio</span>
              </span>
              <ChevronRight className="w-4 h-4 opacity-80" />
            </button>

            {!isAppInstalled && (
              <button
                onClick={() => {
                  onClose();
                  onInstallApp();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Scarica l'App sul telefono</span>
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Guida: Come funziona l'app</span>
              </span>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <span>Personalizza emoji e colore banner</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            <button
              onClick={toggleSnow}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Effetto fiocchi di neve</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  snowing ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {snowing ? 'Attivo' : 'Spento'}
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors mt-2"
              >
                <span className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4" />
                  <span>Pannello Admin (Solo Leo)</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sezione 2: Liste della Famiglia */}
          <div className="space-y-1">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Liste della Famiglia</span>
            </p>

            {/* Tutti i regali */}
            <button
              onClick={() => {
                onSelectMember('all');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base">✨</span>
                <span>Tutti i regali</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedMemberId === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {totalGifts}
              </span>
            </button>

            {/* Singoli membri */}
            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              const isMe = currentUser?.id === m.id;
              const count = giftCounts[m.id] || 0;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMember(m.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{m.avatar}</span>
                    <span className="truncate">{m.name}</span>
                    {isMe && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        Tu
                      </span>
                    )}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : count > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Menu */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 shrink-0">
          🎄 Lista Regali di Natale • Sincronizzata in Cloud
        </div>
      </aside>
    </div>
  );
};
