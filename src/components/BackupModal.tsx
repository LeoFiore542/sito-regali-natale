import React, { useState, useRef } from 'react';
import { FamilyMember, GiftItem } from '../types';
import { exportDatabaseJSON, importDatabaseJSON } from '../lib/storage';
import { X, Download, Upload, Copy, Check, Globe, FileText } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  gifts: GiftItem[];
  currentUserId?: string | null;
  onDataImported: (data: { members: FamilyMember[]; gifts: GiftItem[] }) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  members,
  gifts,
  currentUserId,
  onDataImported,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Scarica file JSON
  const handleExport = async () => {
    const json = await exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-regali-natale-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importa file JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importDatabaseJSON(text, false);
      onDataImported(result);
      setImportStatus('✅ Dati importati con successo!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1200);
    } catch {
      setImportStatus('❌ Errore durante l\'importazione. Verifica che sia un file JSON valido.');
    }
  };

  // Copia lista formattata per WhatsApp / Messaggi
  const handleCopyWhatsApp = () => {
    let text = `🎄 *LE NOSTRE LISTE DI NATALE* 🎁\n\n`;

    members.forEach((m) => {
      const memberGifts = gifts.filter((g) => g.memberId === m.id);
      text += `${m.avatar} *${m.name.toUpperCase()}*\n`;
      if (memberGifts.length === 0) {
        text += `  _(Nessun regalo ancora inserito)_\n`;
      } else {
        memberGifts.forEach((g, i) => {
          text += `  ${i + 1}. *${g.title}*`;
          if (g.price) text += ` (${g.price})`;
          if (g.priority === 'alta') text += ` 🔥`;
          // Mostra chi lo prende per tutti TRANNE che per il proprietario del regalo!
          if (g.reservedBy && m.id !== currentUserId) {
            text += ` [Preso da ${g.reservedBy}]`;
          }
          text += `\n`;
          if (g.description) text += `     📝 ${g.description}\n`;
          if (g.link) text += `     🔗 ${g.link}\n`;
        });
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <h3 className="text-lg font-bold festive-font tracking-wide">
                Condivisione & Backup
              </h3>
              <p className="text-xs text-red-100">
                Condividi con i tuoi cari o salva una copia
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 no-scrollbar">
          {/* Opzione 1: Copia su WhatsApp */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Copia riepilogo per WhatsApp
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Genera un bel testo formattato con tutti i desideri, link e note pronto da incollare nel gruppo di famiglia su WhatsApp o Telegram.
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyWhatsApp}
              className="mt-3 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiato negli appunti! 📋</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia per WhatsApp / Messaggi</span>
                </>
              )}
            </button>
          </div>

          {/* Opzione 2: Esporta / Importa File JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-600" />
                Backup & Sincronizzazione File
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Scarica un file con tutti i regali e foto, oppure caricalo su un altro dispositivo o telefono.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleExport}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Scarica Backup (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Carica Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-xs font-medium text-center pt-1 text-slate-700 animate-in fade-in">
                {importStatus}
              </p>
            )}
          </div>

          {/* Opzione 3: Deploy su GitHub Pages */}
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-800" />
              Come pubblicare su GitHub Pages
            </h4>
            <ol className="mt-2 text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Crea una repository su GitHub e carica questo progetto.</li>
              <li>Nelle impostazioni della repo (<strong>Settings &gt; Pages</strong>), imposta Source su <strong>GitHub Actions</strong>.</li>
              <li>Il workflow automatico incluso compilerà e pubblicherà la pagina gratuitamente in 1 minuto!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
