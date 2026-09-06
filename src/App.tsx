import React, { useState, useEffect, useMemo } from 'react';
import {
  LocalzItem,
  CityConfig,
  Coordinates,
  PharmacyDutyShift,
  UserProfile,
  MainCategory,
  ItemType,
  SponsoredAd,
} from './types';
import { storageService, DEFAULT_USERS } from './services/storageService';
import {
  calculateDistanceKm,
  formatDistance,
  isCurrentlyOpen,
  isShiftActiveNow,
  getCurrentPosition,
  getDirectionsUrl,
} from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { BottomNav, MainNavTab } from './components/BottomNav';
import { ItemCard } from './components/ItemCard';
import { RealMapView } from './components/RealMapView';
import { DutyPharmacySection } from './components/DutyPharmacySection';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { ContributeModal } from './components/ContributeModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ReviewModal } from './components/ReviewModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SettingsModal, SettingsSection } from './components/SettingsModal';
import { CommercialAdsBanner } from './components/CommercialAdsBanner';
import { NetflixTopRow } from './components/NetflixTopRow';
import { NetflixCategoryRow } from './components/NetflixCategoryRow';
import { themeService, ThemeId, THEME_OPTIONS } from './services/themeService';
import { ThemeShowcaseModal } from './components/ThemeShowcaseModal';
import { SponsoredCard } from './components/SponsoredCard';
import { SponsoredDetailModal } from './components/SponsoredDetailModal';
import { CreateSponsoredAdModal } from './components/CreateSponsoredAdModal';
import {
  Sparkles,
  MapPin,
  Clock,
  Star,
  ShieldAlert,
  ChevronRight,
  Flame,
  Calendar,
  Compass,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Phone,
  Navigation,
  Heart,
  MessageCircle,
  Palette,
  ChevronUp,
} from 'lucide-react';
import { useNavVisibility } from './hooks/useNavVisibility';

export default function App() {
  // --- Persistent Storage State ---
  const [cities, setCities] = useState<CityConfig[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityConfig>(storageService.getSelectedCity());
  const [items, setItems] = useState<LocalzItem[]>([]);
  const [shifts, setShifts] = useState<PharmacyDutyShift[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());

  // --- Theme State ---
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(themeService.getCurrentTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    themeService.setTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    themeService.setTheme(themeId);
  };

  // --- UI Navigation & Filter States ---
  const [activeTab, setActiveTab] = useState<MainNavTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);

  // --- Modals State ---
  const [selectedItemDetail, setSelectedItemDetail] = useState<LocalzItem | null>(null);
  const [reviewingItem, setReviewingItem] = useState<LocalzItem | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<SettingsSection>('all');

  // --- Sponsored Ads State ---
  const [activeSponsoredAds, setActiveSponsoredAds] = useState<SponsoredAd[]>([]);
  const [selectedSponsoredAd, setSelectedSponsoredAd] = useState<SponsoredAd | null>(null);
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(false);
  const [targetItemForAd, setTargetItemForAd] = useState<LocalzItem | null>(null);

  // --- Geolocation State ---
  const [userCoords, setUserCoords] = useState<Coordinates | null>(storageService.getUserLocation());
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- Dynamic Navigation Visibility State (Auto-hides on scroll / idle, floating peek) ---
  const { isNavVisible, showNav, hideNav, toggleNav } = useNavVisibility({
    threshold: 14,
    topTolerance: 40,
    autoHideDelay: 6000,
  });

  // Load initial data
  const refreshData = () => {
    setCities(storageService.getCities());
    setItems(storageService.getItems());
    setShifts(storageService.getDutyShifts());
    setFavorites(storageService.getFavorites());
    setCurrentUser(storageService.getCurrentUser());
    const currentCity = storageService.getSelectedCity();
    setSelectedCity(currentCity);
    setActiveSponsoredAds(storageService.getActiveSponsoredAds(currentCity.name));
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setActiveSponsoredAds(storageService.getActiveSponsoredAds(selectedCity.name));
  }, [selectedCity]);

  // Handle GPS location request with clear feedback
  const handleRequestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    getCurrentPosition(
      (coords) => {
        setUserCoords(coords);
        storageService.setUserLocation(coords);
        setLocationLoading(false);

        // Auto find nearest city from coords
        const currentCities = storageService.getCities();
        let closestCity = currentCities[0];
        let minDistance = Infinity;

        currentCities.forEach((city) => {
          const dist = calculateDistanceKm(coords, city.coordinates);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        });

        if (minDistance < 60) {
          // If within 60 km, switch to closest city
          setSelectedCity(closestCity);
          storageService.setSelectedCity(closestCity);
        }
      },
      (errorMsg) => {
        setLocationLoading(false);
        setLocationError(errorMsg);
        alert(errorMsg);
      }
    );
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    storageService.setUserLocation(null);
  };

  const handleSelectCity = (city: CityConfig) => {
    setSelectedCity(city);
    storageService.setSelectedCity(city);
    // Pan resets search
    setSearchQuery('');
  };

  const handleToggleFavorite = (itemId: string) => {
    storageService.toggleFavorite(itemId);
    setFavorites(storageService.getFavorites());
  };

  const handleChangeUser = (user: UserProfile) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
  };

  // Filter items based on active municipality, search, category, and open status
  const cityItems = useMemo(() => {
    return items.filter(
      (item) => item.city.toLowerCase() === selectedCity.name.toLowerCase()
    );
  }, [items, selectedCity]);

  const filteredItems = useMemo(() => {
    return cityItems.filter((item) => {
      // Search query filter (checks title, description, subcategory, tags, and address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSub = item.subcategory.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAddress = item.address.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSub && !matchesTags && !matchesAddress) {
          return false;
        }
      }

      // Category chip filter
      if (selectedCategoryFilter !== 'all') {
        if (selectedCategoryFilter === 'event') {
          if (item.type !== 'event') return false;
        } else if (selectedCategoryFilter === 'place') {
          if (item.type !== 'place') return false;
        } else if (selectedCategoryFilter === 'duty') {
          const isPharmacy = (item as any).isPharmacy;
          const isOnDuty = isPharmacy && shifts.some((s) => s.pharmacyId === item.id && isShiftActiveNow(s));
          if (!isOnDuty) return false;
        } else {
          if (item.category !== selectedCategoryFilter) return false;
        }
      }

      // Only open now filter
      if (onlyOpenNow) {
        if (!isCurrentlyOpen(item)) return false;
      }

      return true;
    });
  }, [cityItems, searchQuery, selectedCategoryFilter, onlyOpenNow, shifts]);

  // Specific groups for Discover feed
  const activeDutyShift = useMemo(() => {
    return shifts.find(
      (s) => s.city.toLowerCase() === selectedCity.name.toLowerCase() && isShiftActiveNow(s)
    );
  }, [shifts, selectedCity]);

  const happeningNowEvents = useMemo(() => {
    return cityItems.filter((i) => i.type === 'event' && i.eventStatus === 'happening_now');
  }, [cityItems]);

  const upcomingEvents = useMemo(() => {
    return cityItems.filter((i) => i.type === 'event' && i.eventStatus !== 'finished');
  }, [cityItems]);

  const gastronomyItems = useMemo(() => {
    return cityItems.filter((i) => i.category === 'gastronomia');
  }, [cityItems]);

  const tourismPlaces = useMemo(() => {
    return cityItems.filter((i) => i.type === 'place');
  }, [cityItems]);

  const favoriteItems = useMemo(() => {
    return items.filter((i) => favorites.includes(i.id));
  }, [items, favorites]);

  const allPharmacyItems = useMemo(() => {
    return items.filter((i) => (i as any).isPharmacy);
  }, [items]);

  return (
    <div
      data-theme={currentTheme}
      className="min-h-screen transition-colors pb-24 flex flex-col"
    >
      {/* Top Navbar Header (Modern glass, auto-hides on scroll) */}
      <Navbar
        selectedCity={selectedCity}
        userCoords={userCoords}
        onOpenCitySelector={() => setIsCityModalOpen(true)}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenContributeModal={() => setIsContributeModalOpen(true)}
        onOpenSettingsModal={() => {
          setSettingsInitialSection('all');
          setIsSettingsModalOpen(true);
        }}
        onOpenPrivacyModal={() => {
          setSettingsInitialSection('privacy');
          setIsSettingsModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenProfile={() => setIsAdminModalOpen(true)}
        isVisible={isNavVisible}
        onToggleImmersive={toggleNav}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4">
        {/* VIEW 1: MAP VIEW */}
        {activeTab === 'map' && (
          <div className="rounded-2xl overflow-hidden border border-neutral-200/80 shadow-md">
            <RealMapView
              items={cityItems}
              selectedCity={selectedCity}
              userCoords={userCoords}
              activeShifts={shifts}
              onSelectItem={(item) => setSelectedItemDetail(item)}
              onRequestLocation={handleRequestLocation}
            />
          </div>
        )}

        {/* VIEW 2: DUTY PHARMACY SECTION */}
        {activeTab === 'duty' && (
          <DutyPharmacySection
            city={selectedCity}
            shifts={shifts}
            userCoords={userCoords}
            onSelectItem={(item) => setSelectedItemDetail(item)}
            onOpenContributeModal={() => setIsContributeModalOpen(true)}
            allPharmacyItems={allPharmacyItems}
          />
        )}

        {/* VIEW 3: SAVED FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">Seus Locais Salvos</h2>
                <p className="text-xs text-neutral-500">
                  {favoriteItems.length} {favoriteItems.length === 1 ? 'item salvo' : 'itens salvos'} para acesso rápido
                </p>
              </div>
            </div>

            {favoriteItems.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-neutral-200 p-6">
                <Heart className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-neutral-700">Nenhum local salvo ainda</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  Toque no ícone de coração nos estabelecimentos, eventos ou farmácias para guardá-los aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    userCoords={userCoords}
                    activeShifts={shifts}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={(it) => setSelectedItemDetail(it)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ADMIN / USER PROFILE */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{currentUser.name}</h3>
                  <p className="text-xs text-neutral-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Nível: {currentUser.reputationLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition"
              >
                Abrir Painel Completo
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <span className="text-2xl font-black text-neutral-900 block">
                  {cityItems.length}
                </span>
                <span className="text-xs text-neutral-500">Cadastros em {selectedCity.name}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <span className="text-2xl font-black text-rose-600 block">
                  {shifts.filter((s) => s.city.toLowerCase() === selectedCity.name.toLowerCase()).length}
                </span>
                <span className="text-xs text-neutral-500">Escalas de Plantão</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <span className="text-2xl font-black text-emerald-600 block">
                  {storageService.getContributions().filter((c) => c.status === 'pending').length}
                </span>
                <span className="text-xs text-neutral-500">Sugestões Pendentes</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <span className="text-2xl font-black text-purple-600 block">
                  {storageService.getReviews().length}
                </span>
                <span className="text-xs text-neutral-500">Avaliações Totais</span>
              </div>
            </div>

            {/* Admin Management direct button */}
            <div className="p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Moderação & Gestão Municipal</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Aprove ou rejeite sugestões da comunidade e cadastre novas escalas de farmácias com validade legal.
                </p>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-bold text-xs rounded-xl transition shrink-0"
              >
                Gerenciar Moderação
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: DISCOVER (HOME FEED) */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* ESPAÇO PARA PROPAGANDAS DE COMÉRCIOS E EVENTOS + PLANTÃO DE UTILIDADE PÚBLICA */}
            <CommercialAdsBanner
              selectedCity={selectedCity}
              activeDutyShift={activeDutyShift}
              onGoToDuty={() => setActiveTab('duty')}
              onOpenCreateAd={() => {
                setTargetItemForAd(null);
                setIsCreateAdModalOpen(true);
              }}
            />

            {/* VITRINE DE OFERTAS & EVENTOS PATROCINADOS (PUBLICIDADE LOCAL PAGA) */}
            {!searchQuery && selectedCategoryFilter === 'all' && (
              <div className="pt-2">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-white shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          Patrocinado
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Destaques & Ofertas em {selectedCity.name}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Espaço publicitário pago para negócios locais. Pagamento compra visibilidade, nunca reputação (não afeta o Localz Score).
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setTargetItemForAd(null);
                        setIsCreateAdModalOpen(true);
                      }}
                      className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Anuncie seu Comércio ou Evento
                    </button>
                  </div>

                  {activeSponsoredAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeSponsoredAds.map((ad) => (
                        <SponsoredCard
                          key={ad.id}
                          ad={ad}
                          onClick={(clickedAd) => {
                            storageService.recordAdMetric(clickedAd.id, 'clicks');
                            setSelectedSponsoredAd(clickedAd);
                          }}
                          onEstablishmentClick={(targetItemId) => {
                            const target = items.find((it) => it.id === targetItemId);
                            if (target) {
                              setSelectedItemDetail(target);
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-zinc-950/60 rounded-xl border border-dashed border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-300">
                        Nenhum anúncio patrocinado ativo nesta cidade hoje.
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Promova sua oferta ou evento no topo do Localz com aprovação rápida da moderação.
                      </p>
                      <button
                        onClick={() => {
                          setTargetItemForAd(null);
                          setIsCreateAdModalOpen(true);
                        }}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition"
                      >
                        Criar Anúncio Agora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STREAMING ROWS (WHEN NOT SEARCHING) */}
            {!searchQuery && selectedCategoryFilter === 'all' && (
              <div className="space-y-6 pt-2">
                {/* 1. EM ALTA NA CIDADE (TOP 10 COM NÚMEROS GIGANTES ESTILO NETFLIX) */}
                <NetflixTopRow
                  title={`Em alta em ${selectedCity.name}`}
                  items={cityItems}
                  userCoords={userCoords}
                  onSelectItem={(item) => setSelectedItemDetail(item)}
                />

                {/* 2. PATRIMÔNIO HISTÓRICO & PONTOS TURÍSTICOS */}
                <NetflixCategoryRow
                  title="Patrimônio Histórico & Pontos Turísticos"
                  subtitle="Igrejas barrocas, praças históricas, casarios e atrações tombadas"
                  items={tourismPlaces.length > 0 ? tourismPlaces : cityItems.slice(0, 4)}
                  userCoords={userCoords}
                  onSelectItem={(item) => setSelectedItemDetail(item)}
                  badgeText="História & Cultura"
                />

                {/* 3. ONDE COMER HOJE (GASTRONOMIA) */}
                <NetflixCategoryRow
                  title="Onde Comer Hoje"
                  subtitle={`A melhor gastronomia, bistrôs e culinária típica de ${selectedCity.name}`}
                  items={gastronomyItems.length > 0 ? gastronomyItems : cityItems.slice(1, 5)}
                  userCoords={userCoords}
                  onSelectItem={(item) => setSelectedItemDetail(item)}
                  badgeText="Gastronomia"
                />

                {/* 4. EVENTOS & AGENDA CULTURAL */}
                {upcomingEvents.length > 0 && (
                  <NetflixCategoryRow
                    title="Eventos & Agenda Cultural"
                    subtitle="Festivais, feiras de artesanato e atrações da comunidade"
                    items={upcomingEvents}
                    userCoords={userCoords}
                    onSelectItem={(item) => setSelectedItemDetail(item)}
                    badgeText="Eventos"
                  />
                )}
              </div>
            )}

            {/* Section Header for Complete Directory */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : `Explorar Todos os Locais (${filteredItems.length})`}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Filtre por categorias, status de abertura ou confira a lista completa de comércios e serviços.
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-red-500 hover:text-red-400 underline"
                >
                  Limpar busca
                </button>
              )}
            </div>

            {/* Horizontal Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Todos ({cityItems.length})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('duty')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                  selectedCategoryFilter === 'duty'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                De Plantão
              </button>

              <button
                onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  onlyOpenNow
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Abertos Agora
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('gastronomia')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'gastronomia'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Onde Comer
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('event')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'event'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Eventos
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('place')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'place'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Pontos Turísticos
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('servicos')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'servicos'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Serviços
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('automotivo')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === 'automotivo'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Oficinas & Auto
              </button>
            </div>

            {/* FARMÁCIA DE PLANTÃO AGORA BANNER (HERO DE UTILIDADE PÚBLICA) */}
            {activeDutyShift && !searchQuery && selectedCategoryFilter === 'all' && (
              <div
                onClick={() => setActiveTab('duty')}
                className="bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white text-rose-800">
                        Plantão Ativo Hoje
                      </span>
                      <span className="text-xs text-rose-100 font-medium">
                        {selectedCity.name}, {selectedCity.state}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold mt-1">
                      {activeDutyShift.pharmacyName}
                    </h3>
                    <p className="text-xs text-rose-100 mt-0.5 line-clamp-1">
                      {activeDutyShift.address} • {activeDutyShift.specialScheduleText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1">
                    Ver Plantão
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}

            {/* SEARCH OR FILTER RESULTS GRID */}
            {(searchQuery || selectedCategoryFilter !== 'all' || onlyOpenNow) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900">
                    {searchQuery ? `Resultados para "${searchQuery}"` : 'Resultados do Filtro'} ({filteredItems.length})
                  </h2>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('all');
                      setOnlyOpenNow(false);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200 p-6">
                    <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-neutral-700">Nenhum resultado encontrado</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Tente buscar por termos mais genéricos ou colabore cadastrando um novo local!
                    </p>
                    <button
                      onClick={() => setIsContributeModalOpen(true)}
                      className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Cadastrar este local
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        userCoords={userCoords}
                        activeShifts={shifts}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={(it) => setSelectedItemDetail(it)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* CURATED DISCOVERY SECTIONS */
              <div className="space-y-8">
                {/* 1. ACONTECENDO AGORA & HOJE */}
                {happeningNowEvents.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-600" />
                        <h2 className="text-base font-extrabold text-neutral-900">
                          Acontecendo Agora em {selectedCity.name}
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        Ao Vivo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {happeningNowEvents.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          userCoords={userCoords}
                          activeShifts={shifts}
                          isFavorite={favorites.includes(item.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onClick={(it) => setSelectedItemDetail(it)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. ONDE COMER (GASTRONOMIA) */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900">
                        Onde Comer em {selectedCity.name}
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Culinária regional, bistrôs, queijarias e cafeterias
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategoryFilter('gastronomia')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                    >
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gastronomyItems.slice(0, 3).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        userCoords={userCoords}
                        activeShifts={shifts}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={(it) => setSelectedItemDetail(it)}
                      />
                    ))}
                  </div>
                </section>

                {/* 3. PONTOS TURÍSTICOS E LUGARES PARA CONHECER */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900">
                        Lugares que Valem a Pena Conhecer
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Parques, mirantes, fontes naturais e patrimônio histórico
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategoryFilter('place')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                    >
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tourismPlaces.slice(0, 3).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        userCoords={userCoords}
                        activeShifts={shifts}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={(it) => setSelectedItemDetail(it)}
                      />
                    ))}
                  </div>
                </section>

                {/* 4. PRÓXIMOS EVENTOS & FEIRAS */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900">
                        Eventos & Programação Local
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Festivais, feiras de artesanato, exposições e música
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategoryFilter('event')}
                      className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-0.5"
                    >
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents.slice(0, 3).map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        userCoords={userCoords}
                        activeShifts={shifts}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={(it) => setSelectedItemDetail(it)}
                      />
                    ))}
                  </div>
                </section>

                {/* 5. MAIS BEM AVALIADOS (LOCALZ SCORE) */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        Mais Bem Avaliados (Localz Score)
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Avaliados pela comunidade sem viés comercial ou patrocinado
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...cityItems]
                      .sort((a, b) => b.localzScore - a.localzScore)
                      .slice(0, 3)
                      .map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          userCoords={userCoords}
                          activeShifts={shifts}
                          isFavorite={favorites.includes(item.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onClick={(it) => setSelectedItemDetail(it)}
                        />
                      ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Floating Island (Modern Glass Dock) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          showNav();
        }}
        favoritesCount={favorites.length}
        hasActiveDuty={!!activeDutyShift}
        isAdmin={currentUser.role === 'admin' || currentUser.role === 'moderator'}
        isVisible={isNavVisible}
        onHideNav={hideNav}
      />

      {/* Floating Peek Handle when menus are hidden */}
      {!isNavVisible && (
        <button
          onClick={showNav}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 active:scale-95 backdrop-blur-2xl border border-white/20 text-xs font-bold text-zinc-200 hover:text-white shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex items-center gap-2 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-3"
          title="Toque para reexibir os menus"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#e50914]" />
          <span>Mostrar Menus</span>
          <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      )}

      {/* MODALS */}
      {/* 1. Item Detail Modal */}
      <ItemDetailModal
        item={selectedItemDetail}
        onClose={() => setSelectedItemDetail(null)}
        userCoords={userCoords}
        activeShifts={shifts}
        reviews={storageService.getReviews(selectedItemDetail?.id)}
        isFavorite={selectedItemDetail ? favorites.includes(selectedItemDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenReviewModal={(item) => setReviewingItem(item)}
        currentUser={currentUser}
        onOpenPromoteModal={(item) => {
          setSelectedItemDetail(null);
          setTargetItemForAd(item);
          setIsCreateAdModalOpen(true);
        }}
      />

      {/* 2. Review Modal */}
      <ReviewModal
        item={reviewingItem}
        isOpen={!!reviewingItem}
        onClose={() => setReviewingItem(null)}
        currentUser={currentUser}
        onReviewSubmitted={refreshData}
      />

      {/* 3. City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        cities={cities}
        selectedCity={selectedCity}
        userCoords={userCoords}
        onSelectCity={handleSelectCity}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
      />

      {/* 4. Contribute Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        city={selectedCity}
        currentUser={currentUser}
        onContributionSubmitted={refreshData}
      />

      {/* 5. Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        onChangeUser={handleChangeUser}
        selectedCity={selectedCity}
        contributions={storageService.getContributions()}
        dutyShifts={shifts}
        onRefreshData={refreshData}
        pharmacyItems={allPharmacyItems}
      />

      {/* 6. Settings Modal (Mobile-first, includes Account, Location, Notifications, Appearance, Privacy & LGPD, Data & About) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        selectedCity={selectedCity}
        userCoords={userCoords}
        locationLoading={locationLoading}
        currentTheme={currentTheme}
        initialSection={settingsInitialSection}
        onOpenCitySelector={() => setIsCityModalOpen(true)}
        onRequestLocation={handleRequestLocation}
        onClearLocation={handleClearLocation}
        onSelectTheme={handleSelectTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenProfileModal={() => setIsAdminModalOpen(true)}
      />

      {/* 7. Privacy & LGPD Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* 7. Theme Showcase Modal */}
      <ThemeShowcaseModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* 8. Sponsored Detail Modal */}
      <SponsoredDetailModal
        ad={selectedSponsoredAd}
        onClose={() => setSelectedSponsoredAd(null)}
        onOpenOrganicItem={(targetItemId) => {
          const target = items.find((it) => it.id === targetItemId);
          if (target) {
            setSelectedSponsoredAd(null);
            setSelectedItemDetail(target);
          }
        }}
        onReportAd={(adId, reason) => {
          storageService.reportSponsoredAd(adId, reason, currentUser.name);
          alert('Denúncia recebida pela moderação do Localz. Investigaremos qualquer inconformidade com nossas diretrizes.');
        }}
      />

      {/* 9. Create Sponsored Ad Modal */}
      <CreateSponsoredAdModal
        isOpen={isCreateAdModalOpen}
        onClose={() => {
          setIsCreateAdModalOpen(false);
          setTargetItemForAd(null);
        }}
        currentUser={currentUser}
        selectedCity={selectedCity}
        existingItems={items}
        preselectedItem={targetItemForAd}
        onAdCreated={() => {
          refreshData();
        }}
      />
    </div>
  );
}
