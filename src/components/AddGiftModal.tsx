import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, GiftItem, PriorityLevel } from '../types';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gift: Omit<GiftItem, 'id' | 'createdAt'>) => void;
  members: FamilyMember[];
  initialMemberId?: string;
  giftToEdit?: GiftItem | null;
}

export const AddGiftModal: React.FC<AddGiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  initialMemberId,
  giftToEdit,
}) => {
  const [memberId, setMemberId] = useState(initialMemberId || (members[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('media');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Popola se è in modalità modifica
  useEffect(() => {
    if (giftToEdit) {
      setMemberId(giftToEdit.memberId);
      setTitle(giftToEdit.title);
      setDescription(giftToEdit.description || '');
      setLink(giftToEdit.link || '');
      setImageUrl(giftToEdit.imageUrl || '');
      setPrice(giftToEdit.price || '');
      setPriority(giftToEdit.priority || 'media');
      if (giftToEdit.imageUrl?.startsWith('data:')) {
        setImageMode('upload');
      } else if (giftToEdit.imageUrl) {
        setImageMode('url');
      }
    } else {
      setMemberId(initialMemberId && initialMemberId !== 'all' ? initialMemberId : (members[0]?.id ?? ''));
      setTitle('');
      setDescription('');
      setLink('');
      setImageUrl('');
      setPrice('');
      setPriority('media');
      setImageMode('upload');
    }
    setUploadError('');
  }, [giftToEdit, initialMemberId, members, isOpen]);

  if (!isOpen) return null;

  // Gestione caricamento file immagine con compressione canvas per performance
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Seleziona un file immagine valido (JPEG, PNG, WebP).');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensionamento max 1000px per mantenere leggerezza e alta qualità
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressedDataUrl);
        } else {
          setImageUrl(event.target?.result as string);
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setUploadError('Impossibile caricare l\'immagine.');
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !memberId) return;

    let cleanLink = link.trim();
    if (cleanLink && !cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
      cleanLink = `https://${cleanLink}`;
    }

    onSave({
      memberId,
      title: title.trim(),
      description: description.trim() || undefined,
      link: cleanLink || undefined,
      imageUrl: imageUrl.trim() || undefined,
      price: price.trim() || undefined,
      priority,
    });

    // Effetto coriandoli natalizi
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#dc2626', '#16a34a', '#eab308', '#ffffff'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Intestazione decorata */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🎁
            </div>
            <div>
              <h3 className="text-lg font-bold festive-font tracking-wide">
                {giftToEdit ? 'Modifica Regalo' : 'Aggiungi un Desiderio'}
              </h3>
              <p className="text-xs text-red-100">
                Inserisci titolo, foto, link e note per la tua lista
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selezione Membro */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Per chi è questo regalo? *
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Titolo / Nome Regalo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Cosa vorresti ricevere? (Nome o Titolo) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Maglione di lana, Kindle, Lego Star Wars..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
          </div>

          {/* Descrizione / Dettagli */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Descrizione o note (opzionale)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Taglia, colore preferito, modello specifico o dove trovarlo..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
            />
          </div>

          {/* Sezione Foto/Immagine */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Foto o Immagine (opzionale)
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    imageMode === 'upload'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Carica File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    imageMode === 'url'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Link URL Web
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Anteprima regalo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-800 text-xs font-medium rounded-lg shadow"
                      >
                        Cambia Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-red-300 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 hover:bg-red-50/20 group"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-700">
                        {isUploading ? 'Elaborazione immagine...' : 'Tocca o clicca per caricare una foto'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        JPEG, PNG, WebP dal tuo cellulare o computer
                      </span>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.example.com/foto-regalo.jpg"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-32 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Anteprima URL"
                      className="max-h-32 w-auto object-contain"
                      onError={() => setUploadError('URL immagine non raggiungibile o non valido')}
                    />
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {uploadError}
              </p>
            )}
          </div>

          {/* Link di acquisto (Amazon o store) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Link per l'acquisto (opzionale)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://amazon.it/dp/... o altro negozio online"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>
          </div>

          {/* Prezzo e Priorità */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Prezzo indicativo (opzionale)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="es. 25€, ~50€"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Priorità del desiderio
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                <option value="alta">🔥 Alta (Lo desidero tanto!)</option>
                <option value="media">⭐ Media (Mi farebbe piacere)</option>
                <option value="bassa">💡 Bassa (Idea carina)</option>
              </select>
            </div>
          </div>

          {/* Pulsanti Azione */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-200 transition-all flex items-center gap-1.5 transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{giftToEdit ? 'Aggiorna Regalo' : 'Aggiungi alla Lista'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
