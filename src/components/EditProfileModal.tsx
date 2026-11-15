import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../types';
import { BANNER_THEMES, getBannerTheme } from '../lib/bannerThemes';
import { X, Sparkles, Check, Palette, Smile, MessageSquare, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onSave: (updated: FamilyMember) => void;
}

const POPULAR_AVATARS = [
  '🎄', '🎅', '🤶', '⛄', '🦌', '🎁', '⭐', '🧝', 
  '❄️', '🍪', '🕯️', '🔔', '🧦', '🍫', '🧸', '🎿',
  '✨', '🎆', '🥂', '🕊️', '👑', '🎉', '🛷', '👼'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🎄');
  const [customEmoji, setCustomEmoji] = useState('');
  const [bannerTheme, setBannerTheme] = useState('red-christmas');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setAvatar(member.avatar);
      setBannerTheme(member.bannerTheme || 'red-christmas');
      setBio(member.bio || '');
      setCustomEmoji('');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const currentTheme = getBannerTheme(bannerTheme);

  const handleCustomEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setCustomEmoji(val);
    if (val) {
      // Prendi l'ultimo o il primo carattere emoji inserito
      const chars = Array.from(val);
      if (chars.length > 0) {
        setAvatar(chars[chars.length - 1]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...member,
      name: name.trim(),
      avatar: avatar || '🎄',
      bannerTheme,
      bio: bio.trim() || undefined,
    });

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: [currentTheme.accentColor, '#eab308', '#ffffff'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Live Preview del Banner in tempo reale */}
        <div className={`relative px-5 sm:px-6 py-4 sm:py-5 text-white bg-gradient-to-r ${currentTheme.gradientClass} transition-all duration-300 overflow-hidden shadow-inner shrink-0`}>
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Chiudi Modal */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge Anteprima */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/20 mb-3">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Anteprima del tuo profilo</span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-lg transform hover:scale-105 transition-transform">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold festive-font tracking-wide truncate">
                {name || 'Il tuo nome'}
              </h3>
              <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                {bio || 'Aggiungi un motto o messaggio natalizio per la famiglia...'}
              </p>
            </div>
          </div>
        </div>

        {/* Form di Personalizzazione */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 no-scrollbar">
          {/* 1. Nome & Soprannome */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <span>Nome visualizzato</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </div>

          {/* 2. Selezione Emoji / Avatar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                <span>Scegli la tua emoji</span>
              </label>
              <span className="text-xs text-slate-400">Attuale: {avatar}</span>
            </div>

            {/* Griglia Emoji popolari */}
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 max-h-36 overflow-y-auto">
              {POPULAR_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-white border-2 border-red-500 scale-110 shadow-md ring-2 ring-red-500/20'
                      : 'hover:bg-white hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Inserimento Emoji libera da tastiera */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={customEmoji}
                onChange={handleCustomEmojiChange}
                placeholder="Oppure incolla qualsiasi emoji da tastiera..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* 3. Colore & Tema del Banner */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>Colore del Banner</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BANNER_THEMES.map((theme) => {
                const isSelected = bannerTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBannerTheme(theme.id)}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 overflow-hidden ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-full h-7 rounded-lg ${theme.previewBg} shadow-inner mb-1 flex items-center justify-end px-1.5`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Motto / Messaggio di stato */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Motto natalizio / Messaggio (opzionale)</span>
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="es. Babbo Natale stupiscimi! / Sono stato bravissimo"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </div>

          {/* Pulsanti Azione */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-200 transition-all flex items-center gap-1.5 transform active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>Salva Personalizzazione</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
