import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Sparkles, Check, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhoAreYouModalProps {
  isOpen: boolean;
  members: FamilyMember[];
  onSelectUser: (member: FamilyMember) => void;
}

export const WhoAreYouModal: React.FC<WhoAreYouModalProps> = ({
  isOpen,
  members,
  onSelectUser,
}) => {
  const [selectedPending, setSelectedPending] = useState<FamilyMember | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedPending) return;
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#eab308', '#ffffff'],
    });
    onSelectUser(selectedPending);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Natalizio */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 px-6 py-7 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-red-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Lista di Natale di Famiglia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold festive-font tracking-wide">
              Chi sei? 🎄
            </h2>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-md mx-auto">
              Seleziona il tuo nome tra quelli della famiglia per accedere alla tua lista dei regali.
            </p>
          </div>
        </div>

        {/* Contenuto / Selezione o Conferma Definitiva */}
        <div className="p-6 sm:p-8">
          {selectedPending ? (
            /* Schermata di Conferma Permanente */
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-200 mx-auto flex items-center justify-center text-5xl shadow-md">
                {selectedPending.avatar}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 festive-font">
                  Sei proprio {selectedPending.name}?
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium max-w-md mx-auto">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Attenzione: una volta confermato, questo dispositivo sarà collegato a te e non potrà più essere cambiato.</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPending(null)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Indietro / Non sono io
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-200 transition-all transform active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Sì, sono {selectedPending.name}! 🎉</span>
                </button>
              </div>
            </div>
          ) : (
            /* Griglia con i membri disponibili */
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center">
                Tocca il tuo nome per iniziare
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedPending(member)}
                    className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-red-50/50 hover:border-red-400 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
