import React from 'react';
import { FamilyMember } from '../types';
import { Sparkles } from 'lucide-react';

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
    <section className="bg-white rounded-2xl px-2.5 py-2.5 sm:px-4 sm:py-3 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
        {/* 1. LA TUA LISTA (sempre prima) */}
        {myMember && (
          <button
            onClick={() => onSelectMember(myMember.id)}
            className="group flex flex-col items-center shrink-0 w-[58px] sm:w-[68px] focus:outline-none active:scale-95 transition-transform"
          >
            <div className="relative">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all ${
                  selectedMemberId === myMember.id
                    ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2 shadow-sm'
                    : 'bg-rose-50 text-slate-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {myMember.avatar}
              </div>
              {/* Badge contatore */}
              <span
                className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border border-white ${
                  selectedMemberId === myMember.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {giftCounts[myMember.id] || 0}
              </span>
            </div>
            <span
              className={`mt-1 text-[11px] leading-tight truncate w-full text-center ${
                selectedMemberId === myMember.id
                  ? 'font-extrabold text-red-600'
                  : 'font-bold text-slate-700'
              }`}
            >
              Tu ({myMember.name})
            </span>
          </button>
        )}

        {/* Divisore verticale sottile */}
        <div className="h-8 w-px bg-slate-200 shrink-0 mx-0.5" />

        {/* 2. TUTTI I REGALI */}
        <button
          onClick={() => onSelectMember('all')}
          className="group flex flex-col items-center shrink-0 w-[54px] sm:w-[64px] focus:outline-none active:scale-95 transition-transform"
        >
          <div className="relative">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-amber-300 ring-2 ring-slate-900 ring-offset-2 shadow-sm'
                  : 'bg-slate-100 text-amber-500 border border-slate-200 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span
              className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border border-white ${
                selectedMemberId === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-600 text-white'
              }`}
            >
              {totalGifts}
            </span>
          </div>
          <span
            className={`mt-1 text-[11px] leading-tight truncate w-full text-center ${
              selectedMemberId === 'all'
                ? 'font-extrabold text-slate-900'
                : 'font-semibold text-slate-600'
            }`}
          >
            Tutti
          </span>
        </button>

        {/* 3. GLI ALTRI MEMBRI DELLA FAMIGLIA */}
        {otherMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const count = giftCounts[member.id] || 0;

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className="group flex flex-col items-center shrink-0 w-[56px] sm:w-[64px] focus:outline-none active:scale-95 transition-transform"
            >
              <div className="relative">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {member.avatar}
                </div>
                {count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border border-white ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[11px] leading-tight truncate w-full text-center ${
                  isSelected
                    ? 'font-extrabold text-emerald-700'
                    : 'font-medium text-slate-600'
                }`}
              >
                {member.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
