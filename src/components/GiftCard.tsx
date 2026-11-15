import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import {
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
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
      className={`group relative bg-white rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 flex flex-col justify-between ${
        isReservedByMe
          ? 'border-emerald-400 bg-emerald-50/15 shadow-xs'
          : isReservedVisible
          ? 'border-slate-200 bg-slate-50/50 opacity-90'
          : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-red-200'
      }`}
    >
      {/* Riga Principale: Miniatura Foto (se presente) + Info */}
      <div className="flex items-start gap-3">
        {/* Foto compatta (solo se caricata, altrimenti icona leggera) */}
        {gift.imageUrl ? (
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
            <img
              src={gift.imageUrl}
              alt={gift.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
            🎁
          </div>
        )}

        {/* Contenuto Centrale */}
        <div className="flex-1 min-w-0">
          {/* Riga Meta: Proprietario + Prezzo + Modifica/Elimina */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold truncate">
                <span>{member?.avatar || '🎄'}</span>
                <span className="truncate">{isMyGift ? 'Tuo desiderio' : member?.name}</span>
              </span>

              {/* Badge Prezzo / Store */}
              {(gift.price || gift.storeName) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-extrabold">
                  <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                  {gift.price && <span>{gift.price}</span>}
                  {gift.price && gift.storeName && <span className="opacity-40">•</span>}
                  {gift.storeName && <span className="font-semibold">{gift.storeName}</span>}
                </span>
              )}
            </div>

            {/* Pulsanti Modifica / Elimina compatti */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => onEdit(gift)}
                title="Modifica"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Vuoi eliminare "${gift.title}" dalla lista?`)) {
                    onDelete(gift.id);
                  }
                }}
                title="Elimina"
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Titolo Regalo */}
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
            {gift.title}
          </h4>

          {/* Descrizione opzionale */}
          {gift.description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
              {gift.description}
            </p>
          )}
        </div>
      </div>

      {/* Barra Inferiore Compatta: Link Acquisto + Stato / "Ci penso io" in un'unica riga */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        {/* Link Acquisto (se presente) */}
        {gift.link ? (
          <a
            href={gift.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{gift.storeName ? `Vedi su ${gift.storeName}` : 'Apri link'}</span>
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-400">Nessun link web</span>
        )}

        {/* Azione Prenotazione (SOLO sui regali degli altri) oppure Info Sorpresa (sui propri) */}
        {!isMyGift ? (
          gift.reservedBy ? (
            <div className="flex items-center gap-1.5 ml-auto">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold ${
                  isReservedByMe
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isReservedByMe ? 'Preso da te!' : `Preso da ${gift.reservedBy}`}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onToggleReserve(gift)}
                className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 text-xs font-bold transition-colors"
                title="Annulla prenotazione"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggleReserve(gift)}
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-all active:scale-95"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Ci penso io!</span>
            </button>
          )
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600/90 bg-rose-50 px-2.5 py-1 rounded-lg">
            <EyeOff className="w-3 h-3 shrink-0" />
            <span>Sorpresa segreta</span>
          </span>
        )}
      </div>
    </article>
  );
};
