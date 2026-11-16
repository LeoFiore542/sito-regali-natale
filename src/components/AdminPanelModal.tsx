import React, { useState } from 'react';
import {
  FamilyMember,
  GiftItem,
  getGiftParticipants,
  getEffectiveReservationMode,
  getGroupMembers,
} from '../types';
import {
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  X,
  AlertTriangle,
  Gift,
  KeyRound,
  Trash2,
  Users,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  gifts: GiftItem[];
  onResetThisDevice: () => void;
  onClearAllGifts: () => void;
  onUnlockGiftReserve: (giftId: string) => void;
  onResetDatabaseFactory: () => void;
  onCreateGroup: (groupName: string, avatar: string, memberIds: string[]) => Promise<void> | void;
  onDeleteGroup: (groupId: string) => Promise<void> | void;
  onSelectGroupList?: (groupId: string) => void;
}

const GROUP_AVATARS = ['🎁', '👨‍👩‍👧', '💑', '🏠', '🎄', '🥂', '✨', '🛋️', '✈️', '🎅'];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  members,
  gifts,
  onResetThisDevice,
  onClearAllGifts,
  onUnlockGiftReserve,
  onResetDatabaseFactory,
  onCreateGroup,
  onDeleteGroup,
  onSelectGroupList,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);
  const [customGroupName, setCustomGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('🎁');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  if (!isOpen) return null;

  const individualMembers = members.filter((m) => !m.isGroup);
  const existingGroups = members.filter((m) => m.isGroup);

  // Genera nome suggerito automatico in base ai membri selezionati
  const selectedMemberObjects = selectedGroupMemberIds
    .map((id) => individualMembers.find((m) => m.id === id))
    .filter((m): m is FamilyMember => Boolean(m));

  const suggestedName =
    selectedMemberObjects.length >= 2
      ? selectedMemberObjects.length === 2
        ? `${selectedMemberObjects[0].name} & ${selectedMemberObjects[1].name}`
        : `${selectedMemberObjects
            .slice(0, -1)
            .map((m) => m.name)
            .join(', ')} & ${selectedMemberObjects[selectedMemberObjects.length - 1].name}`
      : '';

  const toggleMemberForGroup = (memberId: string) => {
    setSelectedGroupMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroupMemberIds.length < 2 || isCreatingGroup) return;
    const finalName = customGroupName.trim() || suggestedName;
    if (!finalName) return;

    setIsCreatingGroup(true);
    try {
      await onCreateGroup(finalName, groupAvatar, selectedGroupMemberIds);
      setSelectedGroupMemberIds([]);
      setCustomGroupName('');
      setGroupAvatar('🎁');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Genera link di reset per i familiari
  const resetLink = `${window.location.origin}${window.location.pathname}?reset=1`;

  const handleCopyResetLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const reservedGifts = gifts.filter((g) => getGiftParticipants(g).length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Admin */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold festive-font tracking-wide">
                  Pannello Admin Leo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-900/40 text-amber-100 border border-amber-200/40">
                  Solo Leo
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Gruppi regali condivisi, sblocchi e gestione famiglia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Sezione 0 (NUOVA): Crea Gruppo per Regalo Condiviso (Solo Admin) */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <Users className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-950">
                  Gruppi di persone che chiedono un regalo condiviso
                </h4>
                <p className="text-xs text-purple-800/90 leading-relaxed mt-0.5">
                  Crea una lista condivisa tra 2 o più familiari (es. <em>Roberto &amp; Rita</em>). Chi fa parte del gruppo (o tu da Admin) può aggiungere i regali desiderati insieme e l'effetto sorpresa sarà protetto per tutti i membri del gruppo!
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-3 bg-white p-3.5 rounded-xl border border-purple-200/80 shadow-sm">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-900 mb-1.5">
                  1. Seleziona almeno 2 persone del gruppo ({selectedGroupMemberIds.length} selezionati)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {individualMembers.map((member) => {
                    const isSelected = selectedGroupMemberIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMemberForGroup(member.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-purple-700 text-white border-purple-700 shadow-sm scale-[1.02]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        <span>{member.avatar}</span>
                        <span>{member.name}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedGroupMemberIds.length >= 2 && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        2. Nome del Gruppo
                      </label>
                      <input
                        type="text"
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder={suggestedName || 'es. Roberto & Rita'}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Icona
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {GROUP_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setGroupAvatar(emoji)}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                              groupAvatar === emoji
                                ? 'bg-purple-100 border-2 border-purple-600 scale-110'
                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingGroup}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      Crea Gruppo "{customGroupName.trim() || suggestedName}"
                    </span>
                  </button>
                </div>
              )}
            </form>

            {/* Elenco Gruppi già creati */}
            {existingGroups.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900">
                  Gruppi Attivi ({existingGroups.length})
                </p>
                <div className="space-y-1.5">
                  {existingGroups.map((group) => {
                    const gMembers = getGroupMembers(group, members);
                    const gGiftCount = gifts.filter((g) => g.memberId === group.id).length;

                    return (
                      <div
                        key={group.id}
                        className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{group.avatar}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{group.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Membri: {gMembers.map((m) => m.name).join(', ')} • {gGiftCount}{' '}
                              {gGiftCount === 1 ? 'regalo' : 'regali'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onSelectGroupList && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectGroupList(group.id);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Apri</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Vuoi eliminare il gruppo "${group.name}" e i regali associati?`
                                )
                              ) {
                                onDeleteGroup(group.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                            title="Elimina gruppo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sezione 1: Sblocca qualcuno che ha sbagliato nome */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Qualcuno in famiglia ha scelto il nome sbagliato?
                </h4>
                <p className="text-xs text-amber-800/90 leading-relaxed mt-0.5">
                  Invia questo link su WhatsApp alla persona che ha sbagliato: aprendolo, il suo smartphone si sbloccherà e gli chiederà nuovamente <strong>"Chi sei?"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={resetLink}
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-slate-700 font-mono select-all"
              />
              <button
                type="button"
                onClick={handleCopyResetLink}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sezione 2: Resetta Questo Dispositivo */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Resetta la scelta utente su questo dispositivo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Cancella l'associazione attuale di questo browser e riapre la schermata di selezione iniziale <em>"Chi sei?"</em> (i regali e le liste non vengono cancellati).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm("Sei sicuro di voler resettare l'utente di questo dispositivo?")) {
                  onResetThisDevice();
                }
              }}
              className="mt-1 w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Resetta e torna a "Chi sei?"</span>
            </button>
          </div>

          {/* Sezione 3: Sblocco Regali Prenotati per Errore */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Gift className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Regali prenotati ({reservedGifts.length})
                </h4>
                <p className="text-xs text-emerald-850 leading-relaxed mt-0.5">
                  Se qualcuno ha segnato "Ci penso io" o "Facciamolo insieme" per sbaglio, puoi liberare il regalo da qui:
                </p>
              </div>
            </div>

            {reservedGifts.length === 0 ? (
              <p className="text-xs text-slate-500 italic pt-1">
                Nessun regalo attualmente prenotato.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto divide-y divide-emerald-100 pt-1">
                {reservedGifts.map((gift) => {
                  const participants = getGiftParticipants(gift);
                  const mode = getEffectiveReservationMode(gift);
                  const names = participants.map((p) => p.name).join(', ');
                  return (
                    <div
                      key={gift.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800">{gift.title}</span>
                        <span className="text-emerald-700 font-medium ml-1.5">
                          ({mode === 'split' ? `Insieme: ${names}` : `Preso da: ${names}`})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnlockGiftReserve(gift.id)}
                        className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors shrink-0"
                      >
                        Sblocca
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sezione 4: Azioni Pericolose di Pulizia */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  Area Pericolo / Reset Database
                </h4>
                <p className="text-xs text-red-800 leading-relaxed mt-0.5">
                  Attenzione: queste azioni cancellano i dati memorizzati.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Vuoi davvero cancellare TUTTI i regali inseriti?')) {
                    onClearAllGifts();
                  }
                }}
                className="py-2 px-3 bg-white hover:bg-red-50 border border-red-300 text-red-700 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Svuota tutti i regali</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'ATTENZIONE: Questo ripristinerà il database alle impostazioni iniziali di fabbrica. Continuare?'
                    )
                  ) {
                    onResetDatabaseFactory();
                  }
                }}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset di fabbrica</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Chiudi Pannello
          </button>
        </div>
      </div>
    </div>
  );
};

