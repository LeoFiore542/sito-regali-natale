import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Plus, UserCheck, Sparkles, X } from 'lucide-react';

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onSelectMember: (id: string | 'all') => void;
  onAddMember: (name: string, avatar: string) => void;
  giftCounts: Record<string, number>;
}

const AVATARS = ['🎅', '🤶', '🎄', '⛄', '🦌', '🎁', '⭐', '🧝', '❄️', '🍪', '🕯️', '🔔'];

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  giftCounts,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember(name.trim(), avatar);
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>Liste di Famiglia</span>
          <span className="text-xs normal-case font-normal text-slate-400">
            (Seleziona chi sta compilando o guardando la lista)
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* Pulsante "Tutti" */}
        <button
          onClick={() => onSelectMember('all')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all whitespace-nowrap shadow-sm border ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-slate-200 ring-2 ring-slate-900/10'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className="text-base">✨</span>
          <span>Tutti i Desideri</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              selectedMemberId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {Object.values(giftCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {/* Membri Esistenti */}
        {members.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const count = giftCounts[member.id] || 0;

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all whitespace-nowrap shadow-sm border ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600 shadow-red-200 ring-2 ring-red-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-lg leading-none">{member.avatar}</span>
              <span>{member.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Pulsante Aggiungi Membro */}
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-medium text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>Nuovo Membro</span>
        </button>
      </div>

      {/* Mini-modal inline per aggiungere un membro velocemente */}
      {isAdding && (
        <div className="mt-3 p-4 bg-white rounded-2xl border border-emerald-100 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Aggiungi qualcuno alla famiglia
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nome (es. Nonna Maria, Zio Luca, Sofia)
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci il nome..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Scegli un'icona natalizia
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                      avatar === av
                        ? 'bg-emerald-100 border-2 border-emerald-600 scale-110 shadow-sm'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Salva Membro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
