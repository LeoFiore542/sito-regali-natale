import React from 'react';
import {
  GiftItem,
  FamilyMember,
  ReservationMode,
  isUserRecipientOfGift,
  getGiftParticipants,
  getEffectiveReservationMode,
  isUserParticipating,
} from '../types';
import {
  CheckCircle2,
  HeartHandshake,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Users,
  UserPlus,
} from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  member: FamilyMember | undefined;
  allMembers: FamilyMember[];
  showMemberBadge?: boolean;
  onSelect: (gift: GiftItem) => void;
  onReserveGift: (gift: GiftItem, mode: ReservationMode) => void;
  onJoinSplitGift: (gift: GiftItem) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  member,
  allMembers,
  showMemberBadge = false,
  onSelect,
  onReserveGift,
  onJoinSplitGift,
  currentUserId,
  currentUserName,
}) => {
  // Protezione sorpresa: true se il regalo è mio oppure se appartengo al gruppo destinatario
  const isMyGift = isUserRecipientOfGift(currentUserId, gift, allMembers);
  const participants = getGiftParticipants(gift);
  const reservationMode = getEffectiveReservationMode(gift);
  const isReservedVisible = !isMyGift && reservationMode !== null;
  const isReservedByMe =
    isReservedVisible && isUserParticipating(gift, currentUserId, currentUserName);

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
          : isReservedVisible && reservationMode === 'split'
          ? 'bg-indigo-50/35 hover:bg-indigo-50/70'
          : isReservedVisible
          ? 'bg-slate-50/70 hover:bg-slate-100/70'
          : 'bg-white hover:bg-red-50/30'
      }`}
    >
      {/* Parte Sinistra: Icona/Miniatura + Titolo e Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Miniatura fissa 44x44px */}
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
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
              member?.isGroup
                ? 'bg-purple-50 border-purple-200'
                : 'bg-red-50 border-red-100'
            }`}
          >
            {member?.avatar || '🎁'}
          </div>
        )}

        {/* Testo Centrale */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4
              className={`text-sm font-bold truncate ${
                isReservedVisible && !isReservedByMe && reservationMode === 'solo'
                  ? 'text-slate-600'
                  : 'text-slate-900 group-hover:text-red-700'
              }`}
            >
              {gift.title}
            </h4>

            {member?.isGroup && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase shrink-0">
                <Users className="w-2.5 h-2.5" />
                <span>Regalo Condiviso</span>
              </span>
            )}
          </div>

          {/* Sottotitolo compatto: destinatario, partecipanti in gruppo, icone allegati */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1 text-[11px] text-slate-500">
            {showMemberBadge && member && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold ${
                  member.isGroup
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span>{member.avatar}</span>
                <span>{isMyGift && !member.isGroup ? 'Tu' : member.name}</span>
              </span>
            )}

            {/* Partecipanti se il regalo è aperto per farlo insieme */}
            {isReservedVisible && reservationMode === 'split' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 border border-indigo-200 text-indigo-900 font-extrabold">
                <Users className="w-3 h-3 text-indigo-700 shrink-0" />
                <span>
                  In {participants.length}: {participants.map((p) => p.name).join(', ')}
                </span>
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
              <span className="inline-flex items-center gap-0.5 text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{gift.description}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parte Destra: Stato / Pulsanti Rapidi + Freccia Popup */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {!isMyGift && (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
            {reservationMode === null ? (
              /* Regalo LIBERO: scelta tra "Ci penso io" o "Insieme" */
              <>
                <button
                  type="button"
                  onClick={() => onReserveGift(gift, 'solo')}
                  title="Ci penso io da solo (chiuso)"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors active:scale-95"
                >
                  <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline sm:inline">Ci penso io</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReserveGift(gift, 'split')}
                  title="Apri per farlo insieme ad altri familiari"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition-colors active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline sm:inline">Insieme</span>
                </button>
              </>
            ) : reservationMode === 'solo' ? (
              /* Regalo preso DA SOLO (chiuso) */
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
                <span className="max-w-[90px] truncate">
                  {isReservedByMe ? 'Preso da te' : participants[0]?.name || gift.reservedBy}
                </span>
              </button>
            ) : (
              /* Regalo in modalità INSIEME (Aperto ad altri) */
              <div className="flex items-center gap-1.5">
                {isReservedByMe ? (
                  <button
                    type="button"
                    onClick={() => onSelect(gift)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"
                  >
                    <Users className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span className="max-w-[110px] truncate">
                      {participants.length === 1
                        ? 'Aperto da te (1)'
                        : `Partecipi (${participants.length})`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onJoinSplitGift(gift)}
                    title={`Unisciti a ${participants.map((p) => p.name).join(', ')} per fare questo regalo insieme`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition-colors active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Anche io! ({participants.length})
                    </span>
                  </button>
                )}
              </div>
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

