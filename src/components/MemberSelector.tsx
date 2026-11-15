import React from 'react';
import { FamilyMember } from '../types';
import { Sparkles, UserCheck, Users } from 'lucide-react';

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
    <section className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-red-100/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-red-600" />
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700">
            Chi vuoi vedere? Scegli una persona:
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400 sm:hidden">
          Scorri 👉
        </span>
      </div>

      {/* Griglia su Desktop / Carosello Orizzontale fluido su Mobile */}
      <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {/* 1. Card speciale: LA TUA LISTA (sempre per prima) */}
        {myMember && (
          <button
            onClick={() => onSelectMember(myMember.id)}
            className={`group relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all shrink-0 min-w-[165px] sm:min-w-0 border-2 active:scale-95 ${
              selectedMemberId === myMember.id
                ? 'bg-gradient-to-br from-red-600 to-rose-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                : 'bg-rose-50/70 hover:bg-rose-100/70 text-slate-900 border-rose-200'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs ${
                selectedMemberId === myMember.id
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-white border border-rose-100'
              }`}
            >
              {myMember.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                    selectedMemberId === myMember.id
                      ? 'bg-white/25 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  Tu
                </span>
                <span className="font-extrabold text-sm truncate">{myMember.name}</span>
              </div>
              <p
                className={`text-xs font-medium mt-0.5 truncate ${
                  selectedMemberId === myMember.id ? 'text-red-100' : 'text-rose-700'
                }`}
              >
                {giftCounts[myMember.id] || 0}{' '}
                {(giftCounts[myMember.id] || 0) === 1 ? 'desiderio' : 'desideri'}
              </p>
            </div>
          </button>
        )}

        {/* 2. Card: TUTTI I REGALI */}
        <button
          onClick={() => onSelectMember('all')}
          className={`group relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all shrink-0 min-w-[160px] sm:min-w-0 border-2 active:scale-95 ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/15'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              selectedMemberId === 'all'
                ? 'bg-white/15 text-amber-300'
                : 'bg-white text-amber-500 border border-slate-200/60 shadow-2xs'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-sm truncate">Tutti i Regali</p>
            <p
              className={`text-xs font-medium mt-0.5 truncate ${
                selectedMemberId === 'all' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {totalGifts} in famiglia
            </p>
          </div>
        </button>

        {/* 3. Tutti gli altri familiari */}
        {otherMembers.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const count = giftCounts[member.id] || 0;

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all shrink-0 min-w-[155px] sm:min-w-0 border-2 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-lg shadow-emerald-700/20'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${
                  isSelected
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-slate-50 border border-slate-100'
                }`}
              >
                {member.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">{member.name}</p>
                <p
                  className={`text-xs font-semibold mt-0.5 truncate ${
                    isSelected
                      ? 'text-emerald-100'
                      : count > 0
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {count === 0
                    ? 'Lista vuota'
                    : `${count} ${count === 1 ? 'desiderio' : 'desideri'}`}
                </p>
              </div>
              {isSelected && (
                <UserCheck className="w-4 h-4 text-emerald-200 shrink-0 hidden sm:block" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
