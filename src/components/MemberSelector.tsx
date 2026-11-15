import React from 'react';
import { FamilyMember } from '../types';

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  onSelectMember: (id: string | 'all') => void;
  giftCounts: Record<string, number>;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  giftCounts,
}) => {
  return (
    <div className="py-2 sm:py-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>Liste di Famiglia</span>
        </h2>
        <span className="text-[11px] text-slate-400">
          Scorri a destra ➡️
        </span>
      </div>

      {/* Lista orizzontale dei soli membri ufficiali */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {/* Pulsante "Tutti" */}
        <button
          onClick={() => onSelectMember('all')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap shadow-xs border shrink-0 active:scale-95 ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-slate-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-sm sm:text-base">✨</span>
          <span>Tutti</span>
          <span
            className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${
              selectedMemberId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {Object.values(giftCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {/* I 10 Membri Ufficiali di Famiglia */}
        {members.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const count = giftCounts[member.id] || 0;

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap shadow-xs border shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600 shadow-red-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-base sm:text-lg leading-none">{member.avatar}</span>
              <span>{member.name}</span>
              <span
                className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold ${
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
      </div>
    </div>
  );
};
