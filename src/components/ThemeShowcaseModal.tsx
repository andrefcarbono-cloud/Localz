import React from 'react';
import { THEME_OPTIONS, ThemeId, ThemeOption } from '../services/themeService';
import {
  X,
  Check,
  Sparkles,
  Palette,
  Eye,
  Moon,
  Sun,
  MapPin,
  Star,
  Clock,
  Compass,
} from 'lucide-react';

interface ThemeShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeShowcaseModal: React.FC<ThemeShowcaseModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-zinc-800 flex items-center justify-between bg-neutral-50/80 dark:bg-zinc-900/90 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-zinc-100 tracking-tight">
                Amostras Visuais de Temas & Cores
              </h2>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">
                Analise e teste ao vivo as 6 paletas de identidade visual do Localz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Tip */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 px-5 py-2.5 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Dica:</strong> Ao clicar em <strong>"Aplicar este Tema"</strong>, o aplicativo inteiro se transforma na hora para você navegar e testar!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-bold text-xs bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
            <span>Tema atual:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
              {THEME_OPTIONS.find((t) => t.id === currentTheme)?.name.split('.')[1]?.trim() || currentTheme}
            </span>
          </div>
        </div>

        {/* Scrollable Content - Grid of Theme Options */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md bg-neutral-50/50 dark:bg-zinc-800/40'
                      : 'border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/80'
                  }`}
                >
                  {/* Theme Header */}
                  <div className="p-4 border-b border-neutral-100 dark:border-zinc-800/80 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 border border-neutral-200 dark:border-zinc-700">
                          {theme.category}
                        </span>
                        {theme.isDark ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-700">
                            <Moon className="w-3 h-3 text-cyan-400" /> Escuro
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            <Sun className="w-3 h-3 text-amber-500" /> Claro
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-neutral-900 dark:text-zinc-100 text-base leading-snug">
                        {theme.name}
                      </h3>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400">
                        {theme.tagline}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="bg-emerald-600 text-white rounded-full p-1 shadow-xs shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Theme Description */}
                  <div className="px-4 pt-3 pb-2 text-xs text-neutral-600 dark:text-zinc-300 leading-relaxed">
                    {theme.description}
                  </div>

                  {/* Palette Swatches */}
                  <div className="px-4 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 block mb-1.5">
                      Paleta de Cores
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-[10px] font-mono border border-neutral-200 dark:border-zinc-700">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 border border-black/10"
                          style={{ backgroundColor: theme.swatches.primary }}
                        />
                        <span className="text-neutral-700 dark:text-zinc-300 font-semibold">Primária: {theme.swatches.primary}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-[10px] font-mono border border-neutral-200 dark:border-zinc-700">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 border border-black/10"
                          style={{ backgroundColor: theme.swatches.accent }}
                        />
                        <span className="text-neutral-700 dark:text-zinc-300 font-semibold">Acento: {theme.swatches.accent}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-[10px] font-mono border border-neutral-200 dark:border-zinc-700">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 border border-black/10"
                          style={{ backgroundColor: theme.swatches.background }}
                        />
                        <span className="text-neutral-700 dark:text-zinc-300 font-semibold">Fundo</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Mini Mockup Preview */}
                  <div className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 block mb-1.5">
                      Amostra de Card no App
                    </span>
                    <div
                      className="p-3.5 rounded-xl border transition-colors shadow-xs"
                      style={{
                        backgroundColor: theme.swatches.card,
                        borderColor: theme.isDark ? '#27272a' : '#e5e7eb',
                        color: theme.swatches.text,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
                              style={{
                                backgroundColor: `${theme.swatches.primary}20`,
                                color: theme.swatches.primary,
                              }}
                            >
                              Verificado Localz
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
                              style={{
                                backgroundColor: `${theme.swatches.accent}20`,
                                color: theme.swatches.accent,
                              }}
                            >
                              Aberto agora
                            </span>
                          </div>
                          <h4
                            className="text-xs font-black truncate"
                            style={{ color: theme.swatches.text }}
                          >
                            {theme.sampleBusinessName}
                          </h4>
                          <p
                            className="text-[10px] truncate opacity-70"
                            style={{ color: theme.swatches.text }}
                          >
                            {theme.sampleSubcategory} • Centro Histórico
                          </p>
                        </div>
                        {/* Score badge */}
                        <div
                          className="px-2 py-1 rounded-lg text-[11px] font-black text-white shrink-0 shadow-xs flex items-center gap-1"
                          style={{ backgroundColor: theme.swatches.primary }}
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{theme.sampleScore.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Mockup Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/40 dark:border-zinc-800 text-[10px]">
                        <span className="opacity-60 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> A 350m de você
                        </span>
                        <span
                          className="font-bold cursor-default flex items-center gap-0.5"
                          style={{ color: theme.swatches.primary }}
                        >
                          Ver perfil & cardápio →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Theme Action Button */}
                  <div className="p-4 mt-auto border-t border-neutral-100 dark:border-zinc-800/80 bg-neutral-50/50 dark:bg-zinc-800/20">
                    <button
                      onClick={() => onSelectTheme(theme.id)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                          : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xs'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Tema Ativo no Momento</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Aplicar este Tema Visual</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Comparative Guide */}
          <div className="bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700/60 rounded-2xl p-4 sm:p-5">
            <h4 className="font-extrabold text-xs sm:text-sm text-neutral-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Guia Rápido de Escolha: Qual estilo combina mais com seu projeto?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600 dark:text-zinc-300">
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                <strong className="text-emerald-700 dark:text-emerald-400 block mb-1">
                  1. Esmeralda ou 4. Terracota:
                </strong>
                Ideais se o foco principal for <strong>turismo ecológico, águas minerais, café, fazendas e artesanato mineiro</strong>.
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                <strong className="text-blue-700 dark:text-blue-400 block mb-1">
                  3. Azul Metropolitano ou 6. Editorial:
                </strong>
                Perfeitos para quem quer um aplicativo com <strong>cara de grande portal de serviços, alta confiabilidade e clareza informativa</strong>.
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                <strong className="text-purple-700 dark:text-purple-400 block mb-1">
                  2. Dark Luxury ou 5. Roxo Neon:
                </strong>
                Melhores opções para foco em <strong>bares, shows, festivais, vida noturna jovem e eventos culturais</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50/80 dark:bg-zinc-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500 dark:text-zinc-400">
            Você pode trocar de tema a qualquer momento pelo botão de paleta no topo.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition shadow-xs"
          >
            Fechar & Navegar no App
          </button>
        </div>
      </div>
    </div>
  );
};
