import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import {
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag,
  ShoppingBag,
  EyeOff,
  RotateCcw,
  HeartHandshake,
} from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  member: FamilyMember | undefined;
  showMemberBadge?: boolean;
  onEdit: (gift: GiftItem) => void;
  onDelete: (id: string) => void;
  onToggleReserve: (gift: GiftItem) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  member,
  onEdit,
  onDelete,
  onToggleReserve,
  currentUserId,
  currentUserName,
}) => {
  // È un regalo della mia lista?
  const isMyGift = !!currentUserId && gift.memberId === currentUserId;

  // L'informazione di prenotazione è visibile a tutti TRANNE che al festeggiato (proprietario del regalo)
  const isReservedVisible = !isMyGift && !!gift.reservedBy;

  // È stato prenotato proprio da me che sto guardando?
  const isReservedByMe =
    isReservedVisible &&
    !!currentUserName &&
    gift.reservedBy?.trim().toLowerCase() === currentUserName.trim().toLowerCase();

  return (
    <article
      className={`group relative bg-white rounded-[1.75rem] border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isReservedByMe
          ? 'border-emerald-400 shadow-lg shadow-emerald-900/5 ring-2 ring-emerald-400/20'
          : isReservedVisible
          ? 'border-slate-200 bg-slate-50/40 opacity-95'
          : 'border-red-100/90 shadow-md shadow-red-950/5 hover:shadow-xl hover:border-red-200 hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Intestazione Card: Di chi è questo desiderio? */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-base shadow-2xs shrink-0">
              {member?.avatar || '🎁'}
            </span>
            <span className="text-xs font-bold text-slate-700 truncate">
              {isMyGift ? 'Il tuo desiderio' : `Desiderio di ${member?.name || 'Famiglia'}`}
            </span>
          </div>

          {/* Azioni Modifica/Elimina (in alto a destra per pulizia) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(gift)}
              title="Modifica regalo"
              className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Vuoi eliminare "${gift.title}" dalla lista?`)) {
                  onDelete(gift.id);
                }
              }}
              title="Elimina regalo"
              className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Immagine del Regalo o Illustrazione Natalizia */}
        <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
          {gift.imageUrl ? (
            <img
              src={gift.imageUrl}
              alt={gift.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-rose-50/70 via-amber-50/40 to-red-50/60 p-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-xs border border-red-100 flex items-center justify-center text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                🎁
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {gift.storeName ? `Disponibile su ${gift.storeName}` : 'Idea Regalo'}
              </span>
            </div>
          )}

          {/* Badge Prezzo Automatico (in sovraimpressione) */}
          {(gift.price || gift.storeName) && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white shadow-lg border border-white/15">
              <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {gift.price && (
                <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                  {gift.price}
                </span>
              )}
              {gift.price && gift.storeName && (
                <span className="text-white/40 text-xs">•</span>
              )}
              {gift.storeName && (
                <span className="text-[11px] font-semibold text-white/90">
                  {gift.storeName}
                </span>
              )}
            </div>
          )}

          {/* Badge Stato Prenotazione sulla Foto (SOLO per gli altri parenti, MAI per il festeggiato!) */}
          {isReservedVisible && (
            <div
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 backdrop-blur-md ${
                isReservedByMe
                  ? 'bg-emerald-600 text-white border border-emerald-400'
                  : 'bg-amber-500 text-white border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {isReservedByMe ? 'Lo compri tu!' : `Preso da ${gift.reservedBy}`}
              </span>
            </div>
          )}
        </div>

        {/* Corpo Testuale: Nome e Descrizione */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2">
            {gift.title}
          </h4>

          {gift.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {gift.description}
            </p>
          )}
        </div>
      </div>

      {/* Area Pulsanti Azione in Basso: Autoesplicativa al 100% */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5">
        {/* 1. Pulsante Link Acquisto (se presente) */}
        {gift.link && (
          <a
            href={gift.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-between transition-colors border border-slate-200/80 group/link"
          >
            <span className="flex items-center gap-2 truncate">
              <ShoppingBag className="w-4 h-4 text-red-600 shrink-0" />
              <span className="truncate">
                {gift.storeName
                  ? `Vedi su ${gift.storeName}`
                  : 'Apri link per acquistarlo'}
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 group-hover/link:text-slate-900 shrink-0 font-semibold">
              {gift.price && <span className="text-emerald-700 font-extrabold">{gift.price}</span>}
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </a>
        )}

        {/* 2. Azione Prenotazione (SOLO sui regali degli altri) oppure Box Sorpresa (sui propri) */}
        {!isMyGift ? (
          gift.reservedBy ? (
            /* Regalo GIÀ PRENOTATO */
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                isReservedByMe
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{isReservedByMe ? '🎉' : '🎀'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold truncate">
                    {isReservedByMe
                      ? 'Prenotato da te!'
                      : `Già prenotato da ${gift.reservedBy}`}
                  </p>
                  <p className="text-[11px] opacity-80 truncate">
                    {member?.name} non vede questa informazione 🤫
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleReserve(gift)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                title="Annulla prenotazione e rendi di nuovo disponibile"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Libera</span>
              </button>
            </div>
          ) : (
            /* Regalo DISPONIBILE -> Invito chiaro a prenotarlo */
            <button
              type="button"
              onClick={() => onToggleReserve(gift)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
              <span>Ci penso io! (Prenota regalo)</span>
            </button>
          )
        ) : (
          /* È IL MIO REGALO -> Mostro la protezione effetto sorpresa e tasto modifica rapido */
          <div className="p-2.5 px-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-900">
              <EyeOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Sorpresa protetta: non vedi chi lo prenota</span>
            </div>
            <button
              type="button"
              onClick={() => onEdit(gift)}
              className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>Modifica</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
