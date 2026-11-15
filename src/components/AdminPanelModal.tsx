import React, { useState } from 'react';
import { FamilyMember, GiftItem } from '../types';
import {
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  X,
  AlertTriangle,
  Gift,
  KeyRound,
  Trash2,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  gifts: GiftItem[];
  onResetThisDevice: () => void;
  onClearAllGifts: () => void;
  onUnlockGiftReserve: (giftId: string) => void;
  onResetDatabaseFactory: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  gifts,
  onResetThisDevice,
  onClearAllGifts,
  onUnlockGiftReserve,
  onResetDatabaseFactory,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Genera link di reset per i familiari
  const resetLink = `${window.location.origin}${window.location.pathname}?reset=1`;

  const handleCopyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const reservedGifts = gifts.filter((g) => !!g.reservedBy);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Admin */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold festive-font tracking-wide">
                  Pannello Admin Leo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-900/40 text-amber-100 border border-amber-200/40">
                  Solo Leo
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Gestione reset, sblocchi e manutenzione della famiglia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Sezione 1: Sblocca qualcuno che ha sbagliato nome */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Qualcuno in famiglia ha scelto il nome sbagliato?
                </h4>
                <p className="text-xs text-amber-800/90 leading-relaxed mt-0.5">
                  Invia questo link su WhatsApp alla persona che ha sbagliato: aprendolo, il suo smartphone si sbloccherà e gli chiederà nuovamente <strong>"Chi sei?"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={resetLink}
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-slate-700 font-mono select-all"
              />
              <button
                type="button"
                onClick={handleCopyResetLink}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sezione 2: Resetta Questo Dispositivo */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Resetta la scelta utente su questo dispositivo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Cancella l'associazione attuale di questo browser e riapre la schermata di selezione iniziale <em>"Chi sei?"</em> (i regali e le liste non vengono cancellati).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Sei sicuro di voler resettare l\'utente di questo dispositivo?')) {
                  onResetThisDevice();
                }
              }}
              className="mt-1 w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Resetta e torna a "Chi sei?"</span>
            </button>
          </div>

          {/* Sezione 3: Sblocco Regali Prenotati per Errore */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Gift className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Regali prenotati ({reservedGifts.length})
                </h4>
                <p className="text-xs text-emerald-850 leading-relaxed mt-0.5">
                  Se qualcuno ha segnato "Ci penso io" per sbaglio su un regalo, puoi sbloccarlo da qui:
                </p>
              </div>
            </div>

            {reservedGifts.length === 0 ? (
              <p className="text-xs text-slate-500 italic pt-1">
                Nessun regalo attualmente prenotato.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-emerald-100 pt-1">
                {reservedGifts.map((gift) => (
                  <div key={gift.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-800">{gift.title}</span>
                      <span className="text-emerald-700 font-medium ml-1.5">
                        (Preso da: {gift.reservedBy})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUnlockGiftReserve(gift.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors shrink-0"
                    >
                      Sblocca
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sezione 4: Azioni Pericolose di Pulizia */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  Area Pericolo / Reset Database
                </h4>
                <p className="text-xs text-red-800 leading-relaxed mt-0.5">
                  Attenzione: queste azioni cancellano i dati memorizzati in questo browser.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Vuoi davvero cancellare TUTTI i regali inseriti?')) {
                    onClearAllGifts();
                  }
                }}
                className="py-2 px-3 bg-white hover:bg-red-50 border border-red-300 text-red-700 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Svuota tutti i regali</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('ATTENZIONE: Questo ripristinerà il database alle impostazioni iniziali di fabbrica. Continuare?')) {
                    onResetDatabaseFactory();
                  }
                }}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset di fabbrica</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Chiudi Pannello
          </button>
        </div>
      </div>
    </div>
  );
};
