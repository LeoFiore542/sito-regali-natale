export interface BannerTheme {
  id: string;
  name: string;
  gradientClass: string;
  badgeBg: string;
  accentColor: string;
  previewBg: string;
}

export const BANNER_THEMES: BannerTheme[] = [
  {
    id: 'red-christmas',
    name: 'Rosso Natale Classico',
    gradientClass: 'from-red-800 via-rose-700 to-red-950',
    badgeBg: 'bg-white/15',
    accentColor: '#dc2626',
    previewBg: 'bg-gradient-to-r from-red-800 to-rose-700',
  },
  {
    id: 'pine-green',
    name: 'Verde Abete & Pino',
    gradientClass: 'from-emerald-950 via-green-800 to-teal-950',
    badgeBg: 'bg-emerald-400/20',
    accentColor: '#16a34a',
    previewBg: 'bg-gradient-to-r from-emerald-900 to-green-700',
  },
  {
    id: 'golden-night',
    name: 'Oro Festivo & Luci',
    gradientClass: 'from-amber-800 via-yellow-700 to-amber-950',
    badgeBg: 'bg-amber-300/20',
    accentColor: '#d97706',
    previewBg: 'bg-gradient-to-r from-amber-700 to-yellow-600',
  },
  {
    id: 'polar-blue',
    name: 'Notte Polare Zaffiro',
    gradientClass: 'from-blue-950 via-indigo-900 to-slate-950',
    badgeBg: 'bg-blue-400/20',
    accentColor: '#2563eb',
    previewBg: 'bg-gradient-to-r from-blue-950 to-indigo-800',
  },
  {
    id: 'royal-purple',
    name: 'Magia Viola Reale',
    gradientClass: 'from-purple-950 via-fuchsia-900 to-indigo-950',
    badgeBg: 'bg-purple-400/20',
    accentColor: '#9333ea',
    previewBg: 'bg-gradient-to-r from-purple-900 to-fuchsia-800',
  },
  {
    id: 'candy-rose',
    name: 'Bastoncino Zucchero Rosa',
    gradientClass: 'from-rose-700 via-pink-600 to-rose-900',
    badgeBg: 'bg-pink-300/20',
    accentColor: '#e11d48',
    previewBg: 'bg-gradient-to-r from-rose-600 to-pink-500',
  },
  {
    id: 'cozy-chocolate',
    name: 'Cioccolata & Cannella',
    gradientClass: 'from-stone-900 via-amber-950 to-stone-950',
    badgeBg: 'bg-amber-200/15',
    accentColor: '#78350f',
    previewBg: 'bg-gradient-to-r from-stone-900 to-amber-950',
  },
  {
    id: 'silver-frost',
    name: 'Ghiaccio & Stelle Argento',
    gradientClass: 'from-slate-800 via-cyan-950 to-slate-950',
    badgeBg: 'bg-cyan-200/20',
    accentColor: '#0891b2',
    previewBg: 'bg-gradient-to-r from-slate-800 to-cyan-900',
  },
];

export function getBannerTheme(id?: string): BannerTheme {
  return BANNER_THEMES.find((t) => t.id === id) || BANNER_THEMES[0];
}
