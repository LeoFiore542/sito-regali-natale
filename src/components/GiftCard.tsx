import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import {
  CheckCircle2,
  HeartHandshake,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  member: FamilyMember | undefined;
  showMemberBadge?: boolean;
  onSelect: (gift: GiftItem) => void;
  onToggleReserve: (gift: GiftItem) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  member,
  showMemberBadge = false,
  onSelect,
  onToggleReserve,
  currentUserId,
  currentUserName,
}) => {
  const isMyGift = Boolean(currentUserId && gift.memberId === currentUserId);
  const isReservedVisible = !isMyGift && Boolean(gift.reservedBy);
  const isReservedByMe =
    isReservedVisible &&
    Boolean(currentUserName) &&
    gift.reservedBy?.trim().toLowerCase() === currentUserName?.trim().toLowerCase();

  return (
    <div
      onClick={() => onSelect(gift)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(gift);
        }
      }}
      className={`group w-full text-left px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
        isReservedByMe
          ? 'bg-emerald-50/40 hover:bg-emerald-50/80'
          : isReservedVisible
          ? 'bg-slate-50/70 hover:bg-slate-100/70'
          : 'bg-white hover:bg-red-50/30'
      }`}
    >
      {/* Parte Sinistra: Icona/Miniatura + Titolo e Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Miniatura fissa 44x44px (w-11 h-11 standard Tailwind v3) */}
        {gift.imageUrl ? (
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            <img
              src={gift.imageUrl}
              alt={gift.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
            {member?.avatar || '🎁'}
          </div>
        )}

        {/* Testo Centrale */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              className={`text-sm font-bold truncate ${
                isReservedVisible && !isReservedByMe
                  ? 'text-slate-600'
                  : 'text-slate-900 group-hover:text-red-700'
              }`}
            >
              {gift.title}
            </h4>
          </div>

          {/* Sottotitolo compatto: destinatario, prezzo, icone allegati */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1 text-[11px] text-slate-500">
            {showMemberBadge && member && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                <span>{member.avatar}</span>
                <span>{isMyGift ? 'Tu' : member.name}</span>
              </span>
            )}

            {gift.price && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-extrabold">
                {gift.price}
              </span>
            )}

            {gift.storeName && (
              <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium">
                <ExternalLink className="w-3 h-3" />
                <span>{gift.storeName}</span>
              </span>
            )}

            {gift.imageUrl && (
              <span className="inline-flex items-center gap-0.5 text-slate-400" title="Contiene foto">
                <ImageIcon className="w-3 h-3" />
              </span>
            )}

            {gift.description && (
              <span className="inline-flex items-center gap-0.5 text-slate-400 truncate max-w-[140px] sm:max-w-[220px]">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{gift.description}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parte Destra: Stato / Pulsante Rapido + Freccia Popup */}
      <div className="flex items-center gap-2 shrink-0">
        {!isMyGift && (
          <div onClick={(e) => e.stopPropagation()}>
            {gift.reservedBy ? (
              <button
                type="button"
                onClick={() => onSelect(gift)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                  isReservedByMe
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[80px] truncate">
                  {isReservedByMe ? 'Preso da te' : gift.reservedBy}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleReserve(gift)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors active:scale-95"
              >
                <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline sm:inline">Ci penso io</span>
              </button>
            )}
          </div>
        )}

        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
