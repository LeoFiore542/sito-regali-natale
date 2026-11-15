import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Monitor,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallNative: boolean;
  onTriggerNativeInstall: () => Promise<void>;
  isAlreadyInstalled: boolean;
}

type DeviceTab = 'ios' | 'android' | 'desktop';

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  canInstallNative,
  onTriggerNativeInstall,
  isAlreadyInstalled,
}) => {
  const [activeTab, setActiveTab] = useState<DeviceTab>('ios');

  useEffect(() => {
    if (!isOpen) return;
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-red-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Festivo */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 px-6 py-6 text-white shrink-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
              📲
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Web App di Famiglia</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold festive-font tracking-wide">
                Scarica l'App sul Telefono
              </h2>
            </div>
          </div>
        </div>

        {/* Corpo Modale */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {isAlreadyInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-extrabold">L'app è già installata su questo dispositivo!</p>
                <p className="text-emerald-700 mt-0.5">
                  Puoi aprirla direttamente dall'icona <strong>"Lista Natale"</strong> sulla tua schermata Home.
                </p>
              </div>
            </div>
          ) : canInstallNative ? (
            /* Installazione immediata 1-Click se il browser supporta beforeinstallprompt */
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 text-center space-y-3">
              <p className="text-sm font-bold text-emerald-950">
                Il tuo dispositivo supporta l'installazione diretta con un clic! 🎉
              </p>
              <button
                onClick={async () => {
                  await onTriggerNativeInstall();
                  onClose();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Installa App Ora</span>
              </button>
            </div>
          ) : null}

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Aggiungi <strong>Lista Natale</strong> alla schermata Home per aprirla a tutto schermo con un tocco, proprio come un'app scaricata dallo store!
          </p>

          {/* Selettore Sistema Operativo */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iPad</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'desktop'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computer</span>
            </button>
          </div>

          {/* Istruzioni Illustrate per iOS (iPhone / iPad) */}
          {activeTab === 'ios' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Tocca il pulsante "Condividi"</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Si trova nella barra in basso di <strong>Safari</strong> (l'icona del quadrato con la freccia verso l'alto).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Scegli "Aggiungi alla schermata Home"</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </span>
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Scorri leggermente verso il basso nel menu che si apre e tocca la voce <strong>"Aggiungi alla schermata Home"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900">
                    Tocca "Aggiungi" in alto a destra ✅
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Troverai l'icona rossa <strong>"Lista Natale"</strong> direttamente tra le tue app!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Istruzioni Illustrate per Android */}
          {activeTab === 'android' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Tocca i 3 puntini in alto a destra</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-700">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </span>
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Nel browser Chrome su Android, apri il menu in alto a destra.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Premi "Installa app" o "Aggiungi a schermata Home"</span>
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Conferma premendo <strong>"Installa"</strong>: l'app comparirà subito sul tuo telefono!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Istruzioni Illustrate per Computer */}
          {activeTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900">
                    Guarda nella barra degli indirizzi in alto
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Su Chrome o Edge vedrai sulla destra l'icona di un piccolo schermo con una freccia <Download className="w-3.5 h-3.5 inline text-slate-800" /> (accanto alla stellina dei preferiti).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-extrabold text-slate-900">
                    Clicca su "Installa Natale in Famiglia"
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Si aprirà come applicazione indipendente sul tuo Mac o PC!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all active:scale-95"
          >
            Perfetto, ho capito!
          </button>
        </div>
      </div>
    </div>
  );
};
