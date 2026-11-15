import React from 'react';
import {
  X,
  Sparkles,
  EyeOff,
  CheckCircle2,
  PlusCircle,
  ShoppingBag,
  HelpCircle,
  Heart,
  ShieldCheck,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  userName,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      number: '1',
      emoji: '✍️',
      title: 'Aggiungi i tuoi desideri',
      description:
        'Vai nella tua lista personale e premi il pulsante rosso "+ Aggiungi Desiderio". Scrivi il nome del regalo e, se vuoi, aggiungi una descrizione, una foto o incolla il link del negozio (il prezzo verrà rilevato in automatico!).',
      badge: 'La tua lista',
      color: 'from-red-500 to-rose-600',
      lightBg: 'bg-red-50 border-red-100 text-red-900',
    },
    {
      number: '2',
      emoji: '👀',
      title: 'Esplora le liste dei familiari',
      description:
        'Tocca il nome o la faccina di un parente nella barra in alto per scoprire cosa gli piacerebbe ricevere sotto l’albero. Se c’è un link, puoi cliccare su "Vedi prodotto" per aprire direttamente la pagina del negozio.',
      badge: 'Niente più dubbi',
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 border-amber-100 text-amber-900',
    },
    {
      number: '3',
      emoji: '🎁',
      title: 'Prenota con "Ci penso io!"',
      description:
        'Hai deciso di comprare quel regalo a un parente? Premi il pulsante "Ci penso io!". In questo modo tutti gli altri familiari vedranno che quel regalo è già stato preso da te e nessuno comprerà un doppione!',
      badge: 'Zero regali doppi',
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-red-100 overflow-hidden my-auto max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Festivo */}
        <div className="relative bg-gradient-to-br from-red-700 via-rose-600 to-amber-700 px-6 py-6 sm:py-7 text-white shrink-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            aria-label="Chiudi guida"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-lg shrink-0">
              🎄
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Guida Rapida di Famiglia</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold festive-font tracking-wide">
                {userName ? `Ciao ${userName}, ecco come funziona!` : 'Come funziona la Lista di Natale'}
              </h2>
            </div>
          </div>
        </div>

        {/* Contenuto Scorrevole */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* I 3 Passi Principali */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-red-200 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-2xl shadow-md shrink-0`}
                >
                  {step.emoji}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Passo {step.number}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${step.lightBg}`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Box Regola d'Oro: Effetto Sorpresa */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                🤫
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>La Regola d'Oro • Effetto Sorpresa 100% Protetto</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold festive-font">
                  Chi riceve il regalo non vede MAI chi lo ha prenotato!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Quando qualcuno clicca <strong>"Ci penso io!"</strong> su un tuo desiderio, <strong>tutti gli altri parenti lo vedono</strong> (così nessuno lo ricompra uguale), ma <strong>tu continuerai a vederlo come un normale desiderio</strong>. La sorpresa a Natale resta intatta!
                </p>
              </div>
            </div>
          </div>

          {/* Domande Frequenti / Dritte */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
              <HelpCircle className="w-4 h-4 text-red-500" />
              <span>Domande Frequenti</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ho cliccato "Ci penso io" per sbaglio!</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nessun problema! Ti basta premere su <strong>"Annulla prenotazione"</strong> sulla stessa scheda e il regalo tornerà subito libero.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Come funziona il prezzo automatico?</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Incollando il link del prodotto (es. Amazon, Zalando, ecc.), il sito legge da solo il prezzo e il nome del negozio!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Posso personalizzare il mio profilo?</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certo! Tocca il tuo nome in alto a destra o il tasto <strong>"Personalizza"</strong> per cambiare la tua emoji, il colore del banner e il tuo motto.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Ho sbagliato a scegliere il mio nome all'inizio?</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chiedi a <strong>Leo (Admin 👑)</strong>: dal suo pannello può inviarti su WhatsApp un link speciale per riscegliere il tuo nome.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">Tutto sincronizzato in tempo reale tra i telefoni</span>
            <span className="sm:hidden">Sincronizzato in tempo reale</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-200 transition-all active:scale-95"
          >
            Ho capito, iniziamo! 🎅
          </button>
        </div>
      </div>
    </div>
  );
};
