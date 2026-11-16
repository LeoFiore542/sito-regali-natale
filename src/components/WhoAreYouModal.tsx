import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Sparkles, Check, AlertTriangle, Gift, EyeOff } from 'lucide-react';
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

  const individualMembers = members.filter((m) => !m.isGroup);

  const handleConfirm = () => {
    if (!selectedPending) return;
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#eab308', '#ffffff'],
    });
    onSelectUser(selectedPending);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border-2 border-red-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Natalizio di Benvenuto */}
        <div className="bg-gradient-to-br from-red-700 via-rose-600 to-amber-700 px-6 py-7 sm:py-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-amber-300/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Benvenuto nella Lista Regali di Famiglia</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold festive-font tracking-wide">
              Chi sei? 🎄
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-md mx-auto leading-relaxed">
              Tocca il tuo nome qui sotto per entrare: potrai scrivere i tuoi desideri e vedere quelli degli altri parenti senza spoilerarti le sorprese!
            </p>
          </div>
        </div>

        {/* Contenuto / Selezione o Conferma Definitiva */}
        <div className="p-5 sm:p-8">
          {selectedPending ? (
            /* Schermata di Conferma Permanente */
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-200 mx-auto flex items-center justify-center text-5xl shadow-lg">
                {selectedPending.avatar}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 festive-font">
                  Ciao {selectedPending.name}! Confermi che sei tu?
                </h3>
                <div className="inline-flex items-start sm:items-center gap-2 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium max-w-md mx-auto text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    Una volta confermato, questo telefono resterà associato a <strong>{selectedPending.name}</strong> per proteggere le sorprese dei tuoi regali.
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPending(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  ← Indietro, ho sbagliato
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-600/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Sì, sono {selectedPending.name}! Entra 🎉</span>
                </button>
              </div>
            </div>
          ) : (
            /* Griglia con i 10 membri ufficiali */
            <div className="space-y-5">
              {/* Pillola informativa rapida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Aggiungi i regali che vorresti ricevere</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Chi prenota i tuoi regali resta segreto a te!</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
                {individualMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedPending(member)}
                    className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200/80 bg-white hover:bg-red-50/60 hover:border-red-500 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-white shadow-sm flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform border border-slate-100">
                      {member.avatar}
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 group-hover:text-red-700 transition-colors text-center truncate w-full">
                      {member.name}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 group-hover:text-red-600 font-bold">
                      Tocca qui →
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
