export type ThemeId = 'emerald' | 'dark' | 'cobalt' | 'terracotta' | 'purple' | 'editorial';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  category: string;
  isDark: boolean;
  swatches: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
  };
  sampleBusinessName: string;
  sampleSubcategory: string;
  sampleScore: number;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: '1. Esmeralda Natural',
    tagline: 'Padrão Clássico & Ecológico',
    description: 'Verde botânico fresco com fundo neutro claro. Ideal para cidades turísticas, montanhas, parques naturais e águas minerais.',
    category: 'Ecológico / Turismo',
    isDark: false,
    swatches: {
      primary: '#059669',     // Emerald 600
      secondary: '#10b981',   // Emerald 500
      accent: '#e11d48',      // Rose plantão
      background: '#f8fafc',  // Slate 50
      card: '#ffffff',
      text: '#0f172a',
    },
    sampleBusinessName: 'Empório & Café das Águas',
    sampleSubcategory: 'Cafeteria & Produtos Regionais',
    sampleScore: 9.8,
  },
  {
    id: 'dark',
    name: '2. Cinema Dark (Estilo Streaming & Cidades Históricas)',
    tagline: 'Preto Absoluto, Vermelho Vibrante & Fotos Históricas',
    description: 'Estilo cinematográfico dark inspirado em plataformas de streaming com fotos históricas de cidades brasileiras, números Top 10 e detalhes em vermelho.',
    category: 'Cinematográfico / Streaming',
    isDark: true,
    swatches: {
      primary: '#e50914',     // Netflix Red
      secondary: '#b80710',
      accent: '#e50914',
      background: '#000000',  // Pure Black
      card: '#141417',        // Deep Slate
      text: '#ffffff',
    },
    sampleBusinessName: 'Bistrô & Empório Histórico',
    sampleSubcategory: 'Gastronomia & Cultura Local',
    sampleScore: 9.9,
  },
  {
    id: 'cobalt',
    name: '3. Azul Metropolitano',
    tagline: 'Urbano, Tech & Dinâmico',
    description: 'Azul cobalto vibrante com detalhes em laranja solar. Estilo de grandes guias metropolitanos com visual corporativo e alta confiabilidade.',
    category: 'Urbano / Serviços',
    isDark: false,
    swatches: {
      primary: '#2563eb',     // Blue 600
      secondary: '#3b82f6',   // Blue 500
      accent: '#f97316',      // Orange 500
      background: '#f1f5f9',  // Slate 100
      card: '#ffffff',
      text: '#0f172a',
    },
    sampleBusinessName: 'Hub Gastronômico Central',
    sampleSubcategory: 'Restaurante & Conectividade',
    sampleScore: 9.7,
  },
  {
    id: 'terracotta',
    name: '4. Terracota & Café Mineiro',
    tagline: 'Acolhedor, Rústico & Artesanal',
    description: 'Tons de argila queimada, caramelo e café colonial, com fundo stone aquecido. Evoca hospitalidade, queijarias tradicionais e arquitetura histórica.',
    category: 'Regional / Minas Gerais',
    isDark: false,
    swatches: {
      primary: '#c2410c',     // Orange 700 (Terracotta)
      secondary: '#d97706',   // Amber 600
      accent: '#b91c1c',      // Dark Red
      background: '#fafaf9',  // Stone 50
      card: '#ffffff',
      text: '#1c1917',        // Stone 900
    },
    sampleBusinessName: 'Queijaria Artesanal da Serra',
    sampleSubcategory: 'Doces & Queijos Premiados',
    sampleScore: 10.0,
  },
  {
    id: 'purple',
    name: '5. Roxo Neon & Festivais',
    tagline: 'Criativo, Cultural & Jovem',
    description: 'Roxo elétrico com acentos em pink e magenta. Direcionado para eventos culturais, shows ao vivo, feiras de arte e entretenimento pulsante.',
    category: 'Cultura & Festivais',
    isDark: false,
    swatches: {
      primary: '#7c3aed',     // Violet 600
      secondary: '#8b5cf6',   // Violet 500
      accent: '#ec4899',      // Pink 500
      background: '#faf5ff',  // Purple 50
      card: '#ffffff',
      text: '#1e1b4b',
    },
    sampleBusinessName: 'Festival de Jazz & Cerveja Local',
    sampleSubcategory: 'Música ao Vivo & Gastronomia',
    sampleScore: 9.9,
  },
  {
    id: 'editorial',
    name: '6. Editorial Minimalista',
    tagline: 'Monocromático, Chic & Curado',
    description: 'Paleta preto e branco com tipografia de forte peso visual e detalhes em dourado fosco. Estilo revista de viagens de luxo e arquitetura.',
    category: 'High-End / Minimalista',
    isDark: false,
    swatches: {
      primary: '#18181b',     // Zinc 900
      secondary: '#3f3f46',   // Zinc 700
      accent: '#b45309',      // Amber 700 (Gold)
      background: '#f4f4f5',  // Zinc 100
      card: '#ffffff',
      text: '#18181b',
    },
    sampleBusinessName: 'Ateliê & Galeria de Design',
    sampleSubcategory: 'Arte & Alta Culinária',
    sampleScore: 9.8,
  },
];

const THEME_STORAGE_KEY = 'localz_selected_theme_v1';

export const themeService = {
  getCurrentTheme(): ThemeId {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved as ThemeId;
      }
    } catch (e) {
      console.warn('Erro ao carregar tema:', e);
    }
    return 'dark';
  },

  setTheme(themeId: ThemeId) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      if (themeId === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Erro ao salvar tema:', e);
    }
  },

  getThemeConfig(themeId: ThemeId): ThemeOption {
    return THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0];
  },
};
