import React from 'react';
import { FamilyMember } from '../types';
import { Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhoAreYouModalProps {
  isOpen: boolean;
  members: FamilyMember[];
  onSelectUser: (member: FamilyMember) => void;
  onExploreAll: () => void;
  canDismiss?: boolean;
  onClose?: () => void;
}

export const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({
  isOpen,
  members,
  onSelectUser,
  onExploreAll,
  canDismiss = false,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSelect = (member: FamilyMember) => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#eab308', '#ffffff'],
    });
    onSelectUser(member);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Natalizio */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Natale in Famiglia 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold festive-font tracking-wide">
              Chi sei? 🎄
            </h2>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-md mx-auto">
              Seleziona il tuo nome per accedere alla tua lista dei regali e vedere cosa desiderano gli altri.
            </p>
          </div>
        </div>

        {/* Griglia Membri */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/60 hover:bg-red-50/40 hover:border-red-400 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-slate-100">
                  {member.avatar}
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-red-700 transition-colors text-center line-clamp-1">
                  {member.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 group-hover:text-red-500 font-medium">
                  Sono io ✨
                </span>
              </button>
            ))}
          </div>

          {/* Azioni secondarie */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <button
              onClick={onExploreAll}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors flex items-center gap-1.5 justify-center"
            >
              <Gift className="w-4 h-4 text-slate-400" />
              <span>Voglio solo curiosare tutti i regali della famiglia</span>
            </button>

            {canDismiss && onClose && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Chiudi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
