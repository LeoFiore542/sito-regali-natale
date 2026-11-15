import React from 'react';
import { GiftItem, FamilyMember } from '../types';
import { ExternalLink, Edit2, Trash2, Tag, Gift, Check, Clock } from 'lucide-react';

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
}) => {
  const isReserved = !!gift.reservedBy;

  const priorityBadge = () => {
    switch (gift.priority) {
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            🔥 Desiderio Top
          </span>
        );
      case 'bassa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            💡 Idea carina
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
        isReserved
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

        {/* Badge Prenotato (Ci pensa qualcuno) */}
        {isReserved && (
          <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-lg text-xs font-semibold flex items-center gap-1 border border-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Preso da {gift.reservedBy}</span>
          </div>
        )}

        {/* Prezzo fluttuante */}
        {gift.price && !isReserved && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{gift.price}</span>
          </div>
        )}
      </div>

      {/* Contenuto Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Badge di priorità */}
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            {priorityBadge()}
            {gift.price && isReserved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <Tag className="w-3 h-3" />
                {gift.price}
              </span>
            )}
          </div>

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
          {/* Link di Acquisto se presente */}
          {gift.link ? (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-colors"
            >
              <span>Vedi prodotto online</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="h-2"></div>
          )}

          {/* Pulsanti di gestione / prenotazione */}
          <div className="flex items-center justify-between gap-1 text-slate-500">
            {/* Toggle "Ci penso io" per i parenti */}
            <button
              onClick={() => onToggleReserve(gift)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isReserved
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isReserved ? 'Segna come non ancora acquistato' : 'Segna che ci pensi tu ad acquistarlo'}
            >
              {isReserved ? (
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
