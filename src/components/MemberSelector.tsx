import React from 'react';
import { FamilyMember } from '../types';

interface MemberSelectorProps {
  members: FamilyMember[];
  selectedMemberId: string | 'all';
  currentUserId?: string | null;
  onSelectMember: (id: string | 'all') => void;
  giftCounts: Record<string, number>;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selectedMemberId,
  currentUserId,
  onSelectMember,
  giftCounts,
}) => {
  const totalGifts = Object.values(giftCounts).reduce((a, b) => a + b, 0);
  const myMember = members.find((m) => m.id === currentUserId);
  const otherMembers = members.filter((m) => m.id !== currentUserId);

  return (
    <section className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* 1. LA TUA LISTA */}
        {myMember && (
          <button
            type="button"
            onClick={() => onSelectMember(myMember.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedMemberId === myMember.id
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-rose-50 text-red-900 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="text-sm leading-none">{myMember.avatar}</span>
            <span>Tu ({myMember.name})</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${
                selectedMemberId === myMember.id
                  ? 'bg-white/25 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {giftCounts[myMember.id] || 0}
            </span>
          </button>
        )}

        {/* 2. TUTTI I REGALI */}
        <button
          type="button"
          onClick={() => onSelectMember('all')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70'
          }`}
        >
          <span className="text-sm leading-none">✨</span>
          <span>Tutti</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${
              selectedMemberId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalGifts}
          </span>
        </button>

        {/* 3. TUTTI GLI ALTRI FAMILIARI */}
        {otherMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const count = giftCounts[member.id] || 0;

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectMember(member.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm leading-none">{member.avatar}</span>
              <span>{member.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : count > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
