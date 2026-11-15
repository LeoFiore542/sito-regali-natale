import React, { useState, useRef, useEffect } from 'react';
import { GiftItem } from '../types';
import { fetchPricePreview, detectStoreName } from '../lib/pricePreview';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle, Tag, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gift: Omit<GiftItem, 'id' | 'createdAt'>) => void;
  initialMemberId: string;
  giftToEdit?: GiftItem | null;
}

export const AddGiftModal: React.FC<AddGiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMemberId,
  giftToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Rilevamento automatico prezzo dal link di acquisto
  const [detectedPrice, setDetectedPrice] = useState<string | null>(null);
  const [detectedStore, setDetectedStore] = useState<string | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Popola se è in modalità modifica
  useEffect(() => {
    if (giftToEdit) {
      setTitle(giftToEdit.title);
      setDescription(giftToEdit.description || '');
      setLink(giftToEdit.link || '');
      setImageUrl(giftToEdit.imageUrl || '');
      setDetectedPrice(giftToEdit.price || null);
      setDetectedStore(giftToEdit.storeName || (giftToEdit.link ? detectStoreName(giftToEdit.link) : null));
      if (giftToEdit.imageUrl?.startsWith('data:')) {
        setImageMode('upload');
      } else if (giftToEdit.imageUrl) {
        setImageMode('url');
      }
    } else {
      setTitle('');
      setDescription('');
      setLink('');
      setImageUrl('');
      setDetectedPrice(null);
      setDetectedStore(null);
      setImageMode('upload');
    }
    setUploadError('');
    setIsFetchingPrice(false);
  }, [giftToEdit, isOpen]);

  // Quando l'utente inserisce o incolla il link di acquisto, rileva in automatico il costo
  useEffect(() => {
    const cleanLink = link.trim();
    if (!cleanLink || (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://') && !cleanLink.includes('.'))) {
      setDetectedPrice(null);
      setDetectedStore(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingPrice(true);
      const store = detectStoreName(cleanLink);
      setDetectedStore(store);

      const res = await fetchPricePreview(cleanLink);
      if (res.priceText) {
        setDetectedPrice(res.priceText);
      }
      if (res.storeName) {
        setDetectedStore(res.storeName);
      }
      setIsFetchingPrice(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [link]);

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
        setUploadError('Impossibile elaborare l\'immagine.');
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !initialMemberId) return;

    let cleanLink = link.trim();
    if (cleanLink && !cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
      cleanLink = `https://${cleanLink}`;
    }

    onSave({
      memberId: initialMemberId,
      title: title.trim(),
      description: description.trim() || undefined,
      link: cleanLink || undefined,
      imageUrl: imageUrl.trim() || undefined,
      price: detectedPrice || undefined,
      storeName: detectedStore || (cleanLink ? detectStoreName(cleanLink) || undefined : undefined),
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#dc2626', '#16a34a', '#eab308', '#ffffff'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Intestazione decorata */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🎁
            </div>
            <div>
              <h3 className="text-lg font-bold festive-font tracking-wide">
                {giftToEdit ? 'Modifica Regalo' : 'Aggiungi Regalo'}
              </h3>
              <p className="text-xs text-red-100">
                Inserisci nome, descrizione, foto e link d'acquisto
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

        {/* Form minimale e pulito */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          
          {/* 1. Nome del Regalo (Obbligatorio) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nome del regalo *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Maglione di lana, Kindle, Lego..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 font-medium"
            />
          </div>

          {/* 2. Descrizione (Opzionale) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Descrizione <span className="text-slate-400 font-normal lowercase">(opzionale)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Taglia, colore preferito, modello specifico o note..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
            />
          </div>

          {/* 3. Foto (Opzionale) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Foto <span className="text-slate-400 font-normal lowercase">(opzionale)</span>
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
                  Link URL
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
                        {isUploading ? 'Caricamento in corso...' : 'Tocca per caricare una foto'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        JPEG, PNG, WebP dal tuo dispositivo
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
                    placeholder="https://images.example.com/foto.jpg"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-32 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Anteprima URL"
                      className="max-h-32 w-auto object-contain"
                      onError={() => setUploadError('URL non valido')}
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

          {/* 4. Link di acquisto (con rilevamento automatico del costo) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Link di acquisto <span className="text-slate-400 font-normal lowercase">(opzionale)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://amazon.it/... o altro link online"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>

            {/* Preview automatica del costo ricavata dal link */}
            {isFetchingPrice && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Rilevamento prezzo dal link in corso...</span>
              </div>
            )}

            {!isFetchingPrice && detectedPrice && (
              <div className="mt-2 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl animate-in fade-in">
                <div className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prezzo stimato:</span>
                  <span className="font-bold text-emerald-950 text-sm">{detectedPrice}</span>
                </div>
                {detectedStore && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    su {detectedStore}
                  </span>
                )}
              </div>
            )}

            {!isFetchingPrice && !detectedPrice && detectedStore && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                <span>Negozio rilevato:</span>
                <span className="font-semibold text-slate-700">{detectedStore}</span>
              </div>
            )}
          </div>

          {/* Pulsanti Azione */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-200 transition-all flex items-center gap-1.5 transform active:scale-95"
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
