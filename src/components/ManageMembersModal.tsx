import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { X, Trash2, Edit2, Check, Users } from 'lucide-react';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  giftCounts: Record<string, number>;
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

const AVATARS = ['🎅', '🤶', '🎄', '⛄', '🦌', '🎁', '⭐', '🧝', '❄️', '🍪', '🕯️', '🔔'];

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  giftCounts,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  if (!isOpen) return null;

  const startEdit = (m: FamilyMember) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditAvatar(m.avatar);
  };

  const handleSave = (member: FamilyMember) => {
    if (!editName.trim()) return;
    onUpdateMember({
      ...member,
      name: editName.trim(),
      avatar: editAvatar || member.avatar,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold festive-font tracking-wide">
                Membri della Famiglia
              </h3>
              <p className="text-xs text-emerald-100">
                Gestisci o modifica i profili della lista
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto space-y-3">
          {members.map((member) => {
            const isEditing = editingId === member.id;
            const count = giftCounts[member.id] || 0;

            return (
              <div key={member.id} className="pt-3 first:pt-0">
                {isEditing ? (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Nome</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Icona</label>
                      <div className="flex flex-wrap gap-1.5">
                        {AVATARS.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => setEditAvatar(a)}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center ${
                              editAvatar === a ? 'bg-emerald-200 border-2 border-emerald-600' : 'bg-white border'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => handleSave(member)}
                        className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Salva
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{member.name}</h4>
                        <p className="text-xs text-slate-500">
                          {count} {count === 1 ? 'regalo in lista' : 'regali in lista'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startEdit(member)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {members.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Sei sicuro di voler eliminare ${member.name}? Verranno rimossi anche i suoi regali.`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Elimina"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Fatto
          </button>
        </div>
      </div>
    </div>
  );
};
