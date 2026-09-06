import {
  LocalzItem,
  PharmacyDutyShift,
  CityConfig,
  CollaborativeContribution,
  Review,
  UserProfile,
  Coordinates,
  SponsoredAd,
  PaymentStatus,
} from '../types';
import {
  SEED_CITIES,
  SEED_ITEMS,
  SEED_DUTY_SHIFTS,
  SEED_REVIEWS,
  SEED_CONTRIBUTIONS,
} from '../data/seedData';
import { SEED_SPONSORED_ADS } from '../data/sponsoredAdsSeed';

const STORAGE_KEYS = {
  ITEMS: 'localz_items_v1',
  SHIFTS: 'localz_shifts_v1',
  CITIES: 'localz_cities_v1',
  REVIEWS: 'localz_reviews_v1',
  CONTRIBUTIONS: 'localz_contributions_v1',
  FAVORITES: 'localz_favorites_v1',
  USER: 'localz_current_user_v1',
  SELECTED_CITY: 'localz_selected_city_v1',
  USER_LOCATION: 'localz_user_location_v1',
  SPONSORED_ADS: 'localz_sponsored_ads_v1',
  SETTINGS: 'localz_app_settings_v1',
};

export interface AppSettings {
  notifications: {
    dutyAlerts: boolean;
    newPlaces: boolean;
    reviewUpdates: boolean;
  };
  location: {
    useGpsWhenAvailable: boolean;
  };
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: {
    dutyAlerts: true,
    newPlaces: true,
    reviewUpdates: true,
  },
  location: {
    useGpsWhenAvailable: true,
  },
};

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'admin-01',
    name: 'Ana Paula Rezende',
    email: 'admin@localz.app.br',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cityDefault: 'São Lourenço',
    contributionsCount: 14,
    approvedCount: 14,
    reputationLevel: 'admin',
  },
  {
    id: 'user-cidadao',
    name: 'Roberto Valente',
    email: 'roberto.valente@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    cityDefault: 'São Lourenço',
    contributionsCount: 4,
    approvedCount: 3,
    reputationLevel: 'colaborador_ativo',
  },
  {
    id: 'user-comerciante',
    name: 'Mariana Silveira',
    email: 'contato@quintadocedro.com.br',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    cityDefault: 'São Lourenço',
    contributionsCount: 2,
    approvedCount: 2,
    reputationLevel: 'guardiao_local',
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  // --- CITIES ---
  getCities(): CityConfig[] {
    return this.get<CityConfig[]>(STORAGE_KEYS.CITIES, SEED_CITIES);
  }

  getSelectedCity(): CityConfig {
    const saved = this.get<CityConfig | null>(STORAGE_KEYS.SELECTED_CITY, null);
    if (saved) return saved;
    const cities = this.getCities();
    return cities[0];
  }

  setSelectedCity(city: CityConfig): void {
    this.set(STORAGE_KEYS.SELECTED_CITY, city);
  }

  // --- ITEMS ---
  getItems(): LocalzItem[] {
    return this.get<LocalzItem[]>(STORAGE_KEYS.ITEMS, SEED_ITEMS);
  }

  saveItems(items: LocalzItem[]): void {
    this.set(STORAGE_KEYS.ITEMS, items);
  }

  addItem(item: LocalzItem): void {
    const items = this.getItems();
    items.unshift(item);
    this.saveItems(items);
  }

  updateItem(updatedItem: LocalzItem): void {
    const items = this.getItems();
    const index = items.findIndex((i) => i.id === updatedItem.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem, updatedAt: new Date().toISOString() };
      this.saveItems(items);
    }
  }

  // --- PHARMACY DUTY SHIFTS ---
  getDutyShifts(): PharmacyDutyShift[] {
    return this.get<PharmacyDutyShift[]>(STORAGE_KEYS.SHIFTS, SEED_DUTY_SHIFTS);
  }

  saveDutyShifts(shifts: PharmacyDutyShift[]): void {
    this.set(STORAGE_KEYS.SHIFTS, shifts);
  }

  addDutyShift(shift: PharmacyDutyShift): void {
    const shifts = this.getDutyShifts();
    shifts.unshift(shift);
    this.saveDutyShifts(shifts);
  }

  updateDutyShift(shift: PharmacyDutyShift): void {
    const shifts = this.getDutyShifts();
    const index = shifts.findIndex((s) => s.id === shift.id);
    if (index !== -1) {
      shifts[index] = shift;
      this.saveDutyShifts(shifts);
    }
  }

  // --- REVIEWS & LOCALZ SCORE ---
  getReviews(itemId?: string): Review[] {
    const all = this.get<Review[]>(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
    if (itemId) {
      return all.filter((r) => r.itemId === itemId);
    }
    return all;
  }

  addReview(review: Review): void {
    const all = this.getReviews();
    all.unshift(review);
    this.set(STORAGE_KEYS.REVIEWS, all);

    // Recalculate item score & count
    const items = this.getItems();
    const item = items.find((i) => i.id === review.itemId);
    if (item) {
      const itemReviews = all.filter((r) => r.itemId === item.id);
      const totalRating = itemReviews.reduce((sum, r) => sum + r.overallRating, 0);
      const avg = totalRating / itemReviews.length;
      
      // Localz Score formula: blends average review with freshness and verified visits
      // Transparent, non-manipulable formula out of 10
      const score = Math.min(10, Math.round(avg * 2 * 10) / 10);
      item.localzScore = score;
      item.reviewCount = itemReviews.length;
      this.saveItems(items);
    }
  }

  // --- COLLABORATIVE CONTRIBUTIONS ---
  getContributions(): CollaborativeContribution[] {
    return this.get<CollaborativeContribution[]>(STORAGE_KEYS.CONTRIBUTIONS, SEED_CONTRIBUTIONS);
  }

  addContribution(contribution: CollaborativeContribution): void {
    const list = this.getContributions();
    list.unshift(contribution);
    this.set(STORAGE_KEYS.CONTRIBUTIONS, list);
  }

  reviewContribution(
    id: string,
    status: 'approved' | 'rejected',
    reviewerName: string,
    rejectionReason?: string
  ): void {
    const list = this.getContributions();
    const contribution = list.find((c) => c.id === id);
    if (!contribution) return;

    contribution.status = status;
    contribution.reviewedAt = new Date().toISOString();
    contribution.reviewedBy = reviewerName;
    if (rejectionReason) {
      contribution.rejectionReason = rejectionReason;
    }
    this.set(STORAGE_KEYS.CONTRIBUTIONS, list);

    // If approved, create or update actual item
    if (status === 'approved') {
      if (contribution.type === 'new_item' && contribution.payload) {
        const newItem: LocalzItem = {
          id: `item-${Date.now()}`,
          type: contribution.itemType || 'business',
          title: contribution.payload.title || 'Novo Item',
          description: contribution.payload.description || '',
          category: contribution.payload.category || 'servicos',
          subcategory: contribution.payload.subcategory || 'Geral',
          tags: contribution.payload.tags || ['local'],
          address: contribution.payload.address || 'Centro',
          neighborhood: contribution.payload.neighborhood || 'Centro',
          city: contribution.city,
          state: 'MG',
          coordinates: contribution.payload.coordinates || { lat: -22.1158, lng: -45.0531 },
          phone: contribution.payload.phone,
          whatsapp: contribution.payload.whatsapp,
          photos: contribution.payload.photos && contribution.payload.photos.length > 0 
            ? contribution.payload.photos 
            : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'],
          verificationStatus: 'community',
          localzScore: 8.0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorId: contribution.userId,
          ...(contribution.itemType === 'event'
            ? {
                startDate: contribution.payload.startDate || new Date().toISOString().split('T')[0],
                startTime: contribution.payload.startTime || '19:00',
                organizerName: contribution.payload.organizerName || contribution.userName,
                isFree: !!contribution.payload.isFree,
                recurrence: 'none',
                eventStatus: 'scheduled',
              }
            : {
                openingHours: [
                  { dayOfWeek: 1, dayName: 'Segunda', isOpen: true, periods: [{ open: '08:00', close: '18:00' }] },
                  { dayOfWeek: 2, dayName: 'Terça', isOpen: true, periods: [{ open: '08:00', close: '18:00' }] },
                  { dayOfWeek: 3, dayName: 'Quarta', isOpen: true, periods: [{ open: '08:00', close: '18:00' }] },
                  { dayOfWeek: 4, dayName: 'Quinta', isOpen: true, periods: [{ open: '08:00', close: '18:00' }] },
                  { dayOfWeek: 5, dayName: 'Sexta', isOpen: true, periods: [{ open: '08:00', close: '18:00' }] },
                  { dayOfWeek: 6, dayName: 'Sábado', isOpen: true, periods: [{ open: '08:00', close: '13:00' }] },
                  { dayOfWeek: 0, dayName: 'Domingo', isOpen: false },
                ],
              }),
        } as LocalzItem;
        this.addItem(newItem);
      } else if (contribution.type === 'new_duty_shift' && contribution.payload) {
        const newShift: PharmacyDutyShift = {
          id: `shift-${Date.now()}`,
          city: contribution.city,
          state: 'MG',
          pharmacyId: contribution.payload.pharmacyId || 'unknown',
          pharmacyName: contribution.payload.pharmacyName || 'Farmácia Municipal',
          address: contribution.payload.address || '',
          phone: contribution.payload.phone || '',
          coordinates: contribution.payload.coordinates || { lat: -22.1162, lng: -45.0535 },
          startDateTime: contribution.payload.startDateTime,
          endDateTime: contribution.payload.endDateTime,
          specialScheduleText: contribution.payload.specialScheduleText || 'Plantão Confirmado',
          source: contribution.payload.source || 'Contribuição Cidadã Verificada pela Moderação',
          sourceType: 'citizen_confirmed',
          status: 'confirmed',
          lastConfirmedDate: new Date().toISOString().split('T')[0],
          confirmedByAdminId: reviewerName,
        };
        this.addDutyShift(newShift);
      }
    }
  }

  // --- FAVORITES ---
  getFavorites(): string[] {
    return this.get<string[]>(STORAGE_KEYS.FAVORITES, ['farm-01', 'gast-01', 'plac-01']);
  }

  toggleFavorite(itemId: string): boolean {
    const favs = this.getFavorites();
    const exists = favs.includes(itemId);
    const updated = exists ? favs.filter((id) => id !== itemId) : [...favs, itemId];
    this.set(STORAGE_KEYS.FAVORITES, updated);
    return !exists;
  }

  isFavorite(itemId: string): boolean {
    return this.getFavorites().includes(itemId);
  }

  // --- AUTH / USER ---
  getCurrentUser(): UserProfile {
    return this.get<UserProfile>(STORAGE_KEYS.USER, DEFAULT_USERS[0]); // Default to Ana Paula (admin) for full app testability
  }

  setCurrentUser(user: UserProfile): void {
    this.set(STORAGE_KEYS.USER, user);
  }

  // --- SAVED GEO LOCATION ---
  getUserLocation(): Coordinates | null {
    return this.get<Coordinates | null>(STORAGE_KEYS.USER_LOCATION, null);
  }

  setUserLocation(coords: Coordinates | null): void {
    this.set(STORAGE_KEYS.USER_LOCATION, coords);
  }

  // --- SPONSORED ADS (PUBLICIDADE E DESTAQUES PATROCINADOS) ---
  getSponsoredAds(): SponsoredAd[] {
    return this.get<SponsoredAd[]>(STORAGE_KEYS.SPONSORED_ADS, SEED_SPONSORED_ADS);
  }

  saveSponsoredAds(ads: SponsoredAd[]): void {
    this.set(STORAGE_KEYS.SPONSORED_ADS, ads);
  }

  getActiveSponsoredAds(cityId?: string, category?: string, type?: 'business' | 'event'): SponsoredAd[] {
    const all = this.getSponsoredAds();
    const today = new Date().toISOString().split('T')[0];

    return all.filter((ad) => {
      // Regra obrigatória: Apenas anúncios com moderação aprovada/ativa E pagamento quitado/cortesia
      const isApproved = ad.moderationStatus === 'active' || ad.moderationStatus === 'approved';
      const isPaid = ad.paymentStatus === 'paid' || ad.paymentStatus === 'complimentary';
      if (!isApproved || !isPaid) return false;

      // Validade de datas
      if (ad.endDate && ad.endDate < today) return false;
      if (ad.startDate && ad.startDate > today) return false;

      // Segmentação geográfica simples (cidade do usuário ou alcance regional 'all')
      if (cityId && cityId !== 'all') {
        const cityMatch =
          ad.targetCities.includes(cityId) ||
          ad.targetCities.includes('all') ||
          ad.targetCities.some((c) => c.toLowerCase() === cityId.toLowerCase());
        if (!cityMatch) return false;
      }

      // Filtro opcional por tipo (comércio/serviço ou evento)
      if (type && ad.type !== type) return false;

      // Filtro opcional por categoria
      if (category && category !== 'all' && ad.category !== category) return false;

      return true;
    });
  }

  addSponsoredAd(newAd: SponsoredAd): void {
    const ads = this.getSponsoredAds();
    // Regra obrigatória: NENHUM anúncio é publicado automaticamente.
    // Força status 'pending_approval' caso não seja rascunho.
    const adWithGuaranteedPending: SponsoredAd = {
      ...newAd,
      moderationStatus: newAd.moderationStatus === 'draft' ? 'draft' : 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moderationHistory: [
        {
          action: 'Criação e Envio para Moderação',
          performedBy: newAd.createdBy.userName,
          date: new Date().toISOString(),
          note: 'Anúncio cadastrado e aguardando revisão da equipe de moderação.',
        },
      ],
    };
    ads.unshift(adWithGuaranteedPending);
    this.saveSponsoredAds(ads);
  }

  updateSponsoredAd(updatedAd: SponsoredAd, requiresReReview = true): void {
    const ads = this.getSponsoredAds();
    const index = ads.findIndex((a) => a.id === updatedAd.id);
    if (index !== -1) {
      const current = ads[index];
      // Alterações importantes em anúncio já aprovado exigem nova análise antes de substituir publicamente
      const nextStatus = requiresReReview && current.moderationStatus === 'active'
        ? 'pending_approval'
        : updatedAd.moderationStatus;

      const history = current.moderationHistory || [];
      history.unshift({
        action: 'Atualização de dados',
        performedBy: updatedAd.createdBy.userName,
        date: new Date().toISOString(),
        note: requiresReReview ? 'Alteração submetida; retorno para fila de moderação.' : 'Ajuste cadastral.',
      });

      ads[index] = {
        ...current,
        ...updatedAd,
        moderationStatus: nextStatus,
        updatedAt: new Date().toISOString(),
        moderationHistory: history,
      };
      this.saveSponsoredAds(ads);
    }
  }

  reviewSponsoredAd(
    id: string,
    decision: 'approved' | 'rejected',
    reviewerName: string,
    rejectionReason?: string
  ): void {
    const ads = this.getSponsoredAds();
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    const now = new Date().toISOString();
    const history = ad.moderationHistory || [];

    if (decision === 'approved') {
      // Se já pago ou cortesia, fica ativo imediatamente; se pendente, fica 'approved' aguardando quitação
      ad.moderationStatus = ad.paymentStatus === 'paid' || ad.paymentStatus === 'complimentary' ? 'active' : 'approved';
      ad.reviewedBy = reviewerName;
      ad.reviewedAt = now;
      ad.rejectionReason = undefined;
      history.unshift({
        action: 'Aprovação de Anúncio',
        performedBy: reviewerName,
        date: now,
        note: 'Anúncio aprovado pela moderação. Conformidade com termos e diretrizes confirmada.',
      });
    } else {
      ad.moderationStatus = 'rejected';
      ad.reviewedBy = reviewerName;
      ad.reviewedAt = now;
      ad.rejectionReason = rejectionReason || 'Anúncio não cumpre as diretrizes editoriais ou regulatórias do Localz.';
      history.unshift({
        action: 'Rejeição de Anúncio',
        performedBy: reviewerName,
        date: now,
        note: `Motivo da rejeição: ${ad.rejectionReason}`,
      });
    }

    ad.updatedAt = now;
    ad.moderationHistory = history;
    this.saveSponsoredAds(ads);
  }

  togglePauseSponsoredAd(id: string, performedBy: string): void {
    const ads = this.getSponsoredAds();
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    const now = new Date().toISOString();
    const history = ad.moderationHistory || [];

    if (ad.moderationStatus === 'active') {
      ad.moderationStatus = 'paused';
      history.unshift({
        action: 'Pausa de Anúncio',
        performedBy,
        date: now,
        note: 'Veiculação do anúncio pausada temporariamente.',
      });
    } else if (ad.moderationStatus === 'paused') {
      ad.moderationStatus = 'active';
      history.unshift({
        action: 'Reativação de Anúncio',
        performedBy,
        date: now,
        note: 'Veiculação do anúncio retomada.',
      });
    }

    ad.updatedAt = now;
    ad.moderationHistory = history;
    this.saveSponsoredAds(ads);
  }

  updateSponsoredAdPayment(id: string, paymentStatus: PaymentStatus, performedBy: string): void {
    const ads = this.getSponsoredAds();
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    const now = new Date().toISOString();
    const history = ad.moderationHistory || [];

    ad.paymentStatus = paymentStatus;
    // Se estiver aprovado pela moderação e agora foi pago, ativa a circulação
    if (ad.moderationStatus === 'approved' && (paymentStatus === 'paid' || paymentStatus === 'complimentary')) {
      ad.moderationStatus = 'active';
    }

    history.unshift({
      action: `Status de pagamento: ${paymentStatus}`,
      performedBy,
      date: now,
      note: `Atualizado para ${paymentStatus}.`,
    });

    ad.updatedAt = now;
    ad.moderationHistory = history;
    this.saveSponsoredAds(ads);
  }

  recordAdMetric(id: string, metric: 'impressions' | 'clicks' | 'contactClicks' | 'mapClicks'): void {
    const ads = this.getSponsoredAds();
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    if (!ad.metrics) {
      ad.metrics = { impressions: 0, clicks: 0, contactClicks: 0, mapClicks: 0 };
    }
    ad.metrics[metric] = (ad.metrics[metric] || 0) + 1;
    this.saveSponsoredAds(ads);
  }

  reportSponsoredAd(id: string, reason: string, reportedBy: string): void {
    const ads = this.getSponsoredAds();
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    const now = new Date().toISOString();
    const history = ad.moderationHistory || [];
    history.unshift({
      action: 'Denúncia recebida da comunidade',
      performedBy: reportedBy || 'Usuário Anônimo',
      date: now,
      note: `Motivo: ${reason}`,
    });
    ad.moderationHistory = history;
    this.saveSponsoredAds(ads);
  }

  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_APP_SETTINGS;
    try {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Reset to seed data if user wants to restore initial state
  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.CITIES);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CONTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.SPONSORED_ADS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
    window.location.reload();
  }
}

export const storageService = new StorageService();
