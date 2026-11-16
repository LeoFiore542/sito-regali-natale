import React from 'react';
import {
  GiftItem,
  FamilyMember,
  ReservationMode,
  isUserRecipientOfGift,
  getGroupMembers,
  getGiftParticipants,
  getEffectiveReservationMode,
  isUserParticipating,
} from '../types';
import {
  X,
  ExternalLink,
  Edit2,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
  EyeOff,
  FileText,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react';

interface GiftDetailModalProps {
  gift: GiftItem | null;
  member: FamilyMember | undefined;
  allMembers: FamilyMember[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (gift: GiftItem) => void;
  onDelete: (id: string) => void;
  onReserveGift: (gift: GiftItem, mode: ReservationMode) => void;
  onJoinSplitGift: (gift: GiftItem) => void;
  onLeaveGift: (gift: GiftItem) => void;
  onSwitchReservationMode: (gift: GiftItem, mode: ReservationMode) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const GiftDetailModal: React.FC<GiftDetailModalProps> = ({
  gift,
  member,
  allMembers,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onReserveGift,
  onJoinSplitGift,
  onLeaveGift,
  onSwitchReservationMode,
  currentUserId,
  currentUserName,
}) => {
  if (!isOpen || !gift) return null;

  const isMyGift = isUserRecipientOfGift(currentUserId, gift, allMembers);
  const groupMembers = getGroupMembers(member, allMembers);
  const participants = getGiftParticipants(gift);
  const reservationMode = getEffectiveReservationMode(gift);
  const isReservedVisible = !isMyGift && reservationMode !== null;
  const isReservedByMe =
    isReservedVisible && isUserParticipating(gift, currentUserId, currentUserName);

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
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xl shrink-0 shadow-sm ${
                member?.isGroup
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {member?.avatar || '🎁'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {member?.isGroup
                  ? `Regalo Condiviso • ${member.name}`
                  : isMyGift
                  ? 'Il tuo desiderio'
                  : `Desiderio di ${member?.name || 'Famiglia'}`}
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

        {/* Corpo Scorrevole: Foto, Titolo, Descrizione, Partecipazione */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Banner informativo se è un Regalo Condiviso di un Gruppo */}
          {member?.isGroup && (
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2 text-xs text-purple-950">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-purple-700 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold">Richiesto dal gruppo {member.name}: </span>
                  <span className="text-purple-800">
                    {groupMembers.map((gm) => `${gm.avatar} ${gm.name}`).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}

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

          {/* Titolo e Badge Negozio / Stato */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {gift.storeName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{gift.storeName}</span>
                </span>
              )}

              {isReservedVisible && reservationMode === 'solo' && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold ${
                    isReservedByMe
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isReservedByMe
                      ? 'Preso da te (Da solo)'
                      : `Preso da ${participants[0]?.name || gift.reservedBy}`}
                  </span>
                </span>
              )}

              {isReservedVisible && reservationMode === 'split' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300">
                  <Users className="w-3.5 h-3.5 text-indigo-700" />
                  <span>
                    Regalo insieme ({participants.length}{' '}
                    {participants.length === 1 ? 'partecipante' : 'partecipanti'})
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

          {/* Sezione Prenotazione ("Ci penso io" oppure "Facciamolo insieme") o Protezione Sorpresa */}
          {!isMyGift ? (
            <div className="pt-1 space-y-3">
              {reservationMode === null ? (
                /* REGALO LIBERO: Scelta tra "Ci penso io (Da solo)" o "Facciamolo insieme (Aperto)" */
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Vuoi fare questo regalo? Scegli come:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {member?.name || 'Il destinatario'} non vedrà mai chi prenota il regalo 🤫
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => onReserveGift(gift, 'solo')}
                      className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-left shadow-sm transition-all active:scale-95 flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm">
                        <HeartHandshake className="w-4 h-4 shrink-0" />
                        <span>Ci penso io (Da solo)</span>
                      </div>
                      <p className="text-[11px] text-emerald-100 leading-snug">
                        Lo fai in autonomia: il regalo risulterà già preso e chiuso.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => onReserveGift(gift, 'split')}
                      className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-left shadow-sm transition-all active:scale-95 flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>Facciamolo insieme</span>
                      </div>
                      <p className="text-[11px] text-indigo-100 leading-snug">
                        Aperto ad altri familiari: chi vuole può aggiungersi con "Anche io!".
                      </p>
                    </button>
                  </div>
                </div>
              ) : reservationMode === 'solo' ? (
                /* REGALO PRENOTATO DA SOLO (CHIUSO) */
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isReservedByMe
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold">
                        {isReservedByMe
                          ? '🎉 Hai prenotato tu questo regalo (Da solo)!'
                          : `🎀 Già prenotato da ${participants[0]?.name || gift.reservedBy}`}
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {isReservedByMe
                          ? `Prenotazione esclusiva chiusa • ${member?.name} non vede nulla 🤫`
                          : `Regalo già preso • ${member?.name} non vede questa informazione 🤫`}
                      </p>
                    </div>
                  </div>

                  {isReservedByMe && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onSwitchReservationMode(gift, 'split')}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Apri ad altri ("Anche io!")</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLeaveGift(gift)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Libera regalo</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* REGALO IN MODALITÀ INSIEME (APERTO AD ALTRI FAMILIARI) */
                <div className="p-4 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 text-indigo-950 space-y-3.5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                      <Users className="w-3.5 h-3.5" />
                      <span>Regalo di Gruppo • Tutti insieme</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {isReservedByMe
                        ? 'Fai parte del gruppo che fa questo regalo!'
                        : 'Questo regalo è aperto: puoi unirti anche tu!'}
                    </h4>
                  </div>

                  {/* Elenco Partecipanti Attuali */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
                      Chi si è proposto per questo regalo ({participants.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {participants.map((p, idx) => {
                        const memberObj = allMembers.find(
                          (m) =>
                            m.id === p.memberId ||
                            m.name.trim().toLowerCase() === p.name.trim().toLowerCase()
                        );
                        return (
                          <span
                            key={`${p.name}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-slate-800 shadow-sm"
                          >
                            <span>{p.avatar || memberObj?.avatar || '🎅'}</span>
                            <span>{p.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Azioni per unirsi o ritirarsi */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!isReservedByMe ? (
                      <button
                        type="button"
                        onClick={() => onJoinSplitGift(gift)}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Anche io! Partecipo al regalo</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onLeaveGift(gift)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>
                            {participants.length === 1
                              ? 'Annulla e libera regalo'
                              : 'Ritirati dal gruppo'}
                          </span>
                        </button>

                        {participants.length === 1 && (
                          <button
                            type="button"
                            onClick={() => onSwitchReservationMode(gift, 'solo')}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Passa a "Ci penso io (Da solo)"</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-900 font-medium">
              <EyeOff className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>Effetto sorpresa attivo:</strong> se qualcuno prenota questo regalo, tu{member?.isGroup ? ' e gli altri membri del gruppo non lo vedrete' : ' non lo vedrai'}.
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

