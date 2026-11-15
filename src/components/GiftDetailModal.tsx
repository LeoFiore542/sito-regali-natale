import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import {
  X,
  ExternalLink,
  Edit2,
  Trash2,
  Tag,
  ShoppingBag,
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
  EyeOff,
  FileText,
} from 'lucide-react';

interface GiftDetailModalProps {
  gift: GiftItem | null;
  member: FamilyMember | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (gift: GiftItem) => void;
  onDelete: (id: string) => void;
  onToggleReserve: (gift: GiftItem) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GiftDetailModal: React.FC<GiftDetailModalProps> = ({
  gift,
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleReserve,
  currentUserId,
  currentUserName,
}) => {
  if (!isOpen || !gift) return null;

  const isMyGift = Boolean(currentUserId && gift.memberId === currentUserId);
  const isReservedVisible = !isMyGift && Boolean(gift.reservedBy);
  const isReservedByMe =
    isReservedVisible &&
    Boolean(currentUserName) &&
    gift.reservedBy?.trim().toLowerCase() === currentUserName?.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intestazione Popup */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
              {member?.avatar || '🎁'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isMyGift ? 'Il tuo desiderio' : `Desiderio di ${member?.name || 'Famiglia'}`}
              </p>
              <h3 className="text-sm font-extrabold text-slate-800 truncate">
                Scheda Dettaglio Regalo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors shrink-0"
            aria-label="Chiudi scheda"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo Scorrevole: Foto, Titolo, Prezzo, Descrizione */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Foto Grande (se presente) */}
          {gift.imageUrl && (
            <div className="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 max-h-72 flex items-center justify-center">
              <img
                src={gift.imageUrl}
                alt={gift.title}
                className="w-full h-full max-h-72 object-contain"
              />
            </div>
          )}

          {/* Titolo e Badge Prezzo */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {(gift.price || gift.storeName) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  {gift.price && <span>{gift.price}</span>}
                  {gift.price && gift.storeName && <span>•</span>}
                  {gift.storeName && <span>{gift.storeName}</span>}
                </span>
              )}

              {isReservedVisible && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold ${
                    isReservedByMe
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isReservedByMe ? 'Prenotato da te' : `Prenotato da ${gift.reservedBy}`}
                  </span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {gift.title}
            </h2>
          </div>

          {/* Descrizione (se presente) */}
          {gift.description ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Descrizione e dettagli</span>
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {gift.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Nessuna descrizione aggiuntiva inserita per questo regalo.
            </p>
          )}

          {/* Pulsante Link di Acquisto */}
          {gift.link && (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-sm transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {gift.storeName
                    ? `Apri pagina prodotto su ${gift.storeName}`
                    : 'Apri link di acquisto'}
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
            </a>
          )}

          {/* Sezione Prenotazione ("Ci penso io!") oppure Protezione Sorpresa */}
          {!isMyGift ? (
            <div className="pt-1">
              {gift.reservedBy ? (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isReservedByMe
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold">
                      {isReservedByMe
                        ? '🎉 Hai prenotato tu questo regalo!'
                        : `🎀 Già prenotato da ${gift.reservedBy}`}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {member?.name} non vede questa informazione 🤫
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleReserve(gift)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Libera</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleReserve(gift)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-5 h-5" />
                  <span>Ci penso io! (Prenota questo regalo)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-900 font-medium">
              <EyeOff className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>Effetto sorpresa attivo:</strong> se qualcuno prenota questo regalo, tu non lo vedrai.
              </span>
            </div>
          )}
        </div>

        {/* Footer Azioni: Modifica, Elimina e Chiudi */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(gift);
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifica</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Vuoi eliminare "${gift.title}" dalla lista?`)) {
                  onDelete(gift.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Elimina</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
