import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import { ExternalLink, Edit2, Trash2, Gift, Check, Clock, Sparkles, Tag } from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  member: FamilyMember | undefined;
  showMemberBadge?: boolean;
  onEdit: (gift: GiftItem) => void;
  onDelete: (id: string) => void;
  onToggleReserve: (gift: GiftItem) => void;
  currentUserId?: string;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  member,
  showMemberBadge = false,
  onEdit,
  onDelete,
  onToggleReserve,
  currentUserId,
}) => {
  // È un regalo della mia lista?
  const isMyGift = !!currentUserId && gift.memberId === currentUserId;

  // L'informazione di prenotazione è visibile a tutti TRANNE che al festeggiato (proprietario del regalo)
  const isReservedVisible = !isMyGift && !!gift.reservedBy;

  return (
    <div
      className={`group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
        isReservedVisible
          ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
          : 'border-red-100/80 shadow-md hover:shadow-xl hover:border-red-200 hover:-translate-y-0.5'
      }`}
    >
      {/* Immagine o Placeholder decorato */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 w-full h-full bg-gradient-to-br from-red-50/50 to-amber-50/30">
            <Gift className="w-12 h-12 text-red-200 mb-1" />
            <span className="text-xs text-slate-400 font-medium">Nessuna foto</span>
          </div>
        )}

        {/* Badge del Membro proprietario */}
        {showMemberBadge && member && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5 border border-slate-100">
            <span>{member.avatar}</span>
            <span>{member.name}</span>
          </div>
        )}

        {/* Badge Prenotato: Visibile a tutta la famiglia MAI a chi deve ricevere il regalo! */}
        {isReservedVisible && (
          <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-lg text-xs font-semibold flex items-center gap-1 border border-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Preso da {gift.reservedBy}</span>
          </div>
        )}

        {/* Preview del Prezzo / Costo ricavato dal link di acquisto */}
        {gift.price && (
          <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md border border-white/15">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{gift.price}</span>
          </div>
        )}
      </div>

      {/* Contenuto Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Titolo del Regalo */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">
            {gift.title}
          </h3>

          {/* Descrizione */}
          {gift.description && (
            <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
              {gift.description}
            </p>
          )}
        </div>

        {/* Sezione Link e Azioni in basso */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          {/* Link di Acquisto se presente con indicazione del negozio e prezzo */}
          {gift.link ? (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-colors group/link"
            >
              <span className="truncate">
                Vedi su {gift.storeName || 'negozio online'}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                {gift.price && (
                  <span className="font-bold text-red-900 bg-red-100 px-1.5 py-0.5 rounded-md text-[11px]">
                    {gift.price}
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ) : (
            <div className="h-1"></div>
          )}

          {/* Pulsanti di gestione / prenotazione */}
          <div className="flex items-center justify-between gap-1 text-slate-500">
            {/* Toggle "Ci penso io" SOLO per i regali altrui. Per i propri regali l'utente non vede alcuno stato */}
            {!isMyGift ? (
              <button
                onClick={() => onToggleReserve(gift)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  gift.reservedBy
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={gift.reservedBy ? 'Segna come non ancora acquistato' : 'Segna che ci pensi tu ad acquistarlo'}
              >
                {gift.reservedBy ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Acquistato</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ci penso io</span>
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium px-2 py-1">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Il tuo desiderio</span>
              </span>
            )}

            {/* Modifica ed Elimina */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(gift)}
                title="Modifica regalo"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Sei sicuro di voler rimuovere "${gift.title}" dalla lista?`)) {
                    onDelete(gift.id);
                  }
                }}
                title="Elimina regalo"
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
