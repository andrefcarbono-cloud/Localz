export type ItemType = 'business' | 'place' | 'event' | 'service';

export type MainCategory = 
  | 'gastronomia'
  | 'hospedagem'
  | 'compras'
  | 'servicos'
  | 'saude_farmacia'
  | 'turismo_lazer'
  | 'eventos_cultura'
  | 'automotivo';

export type VerificationStatus = 
  | 'community'    // Cadastrado pela comunidade
  | 'claimed'      // Reivindicado pelo proprietário
  | 'verified'     // Verificado oficialmente pelo Localz
  | 'pending';     // Pendente de aprovação

export type RecurrenceType = 
  | 'none'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'specific_days'
  | 'traditional_edition';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OpeningHour {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  dayName: string;
  isOpen: boolean;
  is24h?: boolean;
  periods?: Array<{
    open: string;  // "08:00"
    close: string; // "18:00"
  }>;
}

export interface ReviewDimension {
  key: string;
  label: string;
  rating: number; // 1 to 5
}

export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  overallRating: number;
  dimensions: ReviewDimension[];
  comment: string;
  createdAt: string;
  verifiedVisit?: boolean;
}

export interface BaseItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: MainCategory;
  subcategory: string;
  tags: string[];
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates: Coordinates;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  photos: string[];
  isSponsored?: boolean;
  verificationStatus: VerificationStatus;
  localzScore: number; // 0 to 10
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface BusinessItem extends BaseItem {
  type: 'business' | 'service';
  is24h?: boolean;
  isPharmacy?: boolean;
  priceRange?: 'R$' | 'R$$' | 'R$$$' | 'R$$$$';
  openingHours: OpeningHour[];
  amenities?: string[];
  ownerId?: string;
}

export interface PlaceItem extends BaseItem {
  type: 'place';
  admission: 'free' | 'paid' | 'donation';
  admissionPrice?: string;
  openingHours?: OpeningHour[];
  bestTimeVisit?: string;
  accessibilityFeatures?: string[];
}

export interface EventItem extends BaseItem {
  type: 'event';
  startDate: string; // ISO date string or YYYY-MM-DD
  endDate?: string;
  startTime: string; // "19:30"
  endTime?: string;
  organizerName: string;
  organizerReputationScore?: number;
  isFree: boolean;
  ticketPrice?: string;
  ticketLink?: string;
  recurrence: RecurrenceType;
  recurrenceDetails?: string;
  eventStatus: 'scheduled' | 'happening_now' | 'finished' | 'cancelled';
}

export type LocalzItem = BusinessItem | PlaceItem | EventItem;

// 4. Farmácia de Plantão Model
export type MunicipalDutyModel = 
  | 'rotation'      // Rodízio programado entre farmácias
  | 'permanent_24h' // Farmácia 24h permanente
  | 'multi_24h'     // Múltiplas farmácias 24h
  | 'scheduled'     // Escala municipal especial
  | 'none_defined'; // Nenhuma escala cadastrada

export interface PharmacyDutyShift {
  id: string;
  city: string;
  state: string;
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  phone: string;
  whatsapp?: string;
  coordinates: Coordinates;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  specialScheduleText: string; // ex: "Das 18h00 às 22h00" ou "Pernoite 24h"
  source: string; // ex: "Prefeitura Municipal - Decreto nº 4.120/2026"
  sourceType: 'official_decree' | 'commercial_assoc' | 'pharmacy_union' | 'citizen_confirmed';
  status: 'confirmed' | 'under_review' | 'expired';
  lastConfirmedDate: string;
  notes?: string;
  confirmedByAdminId?: string;
}

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  stateName: string;
  coordinates: Coordinates;
  population?: number;
  dutyModel: MunicipalDutyModel;
  dutyModelDescription: string;
  dutySourceOfficial?: string;
  isActive: boolean;
}

export interface CollaborativeContribution {
  id: string;
  type: 'new_item' | 'edit_item' | 'new_duty_shift' | 'report_issue';
  itemType?: ItemType;
  targetItemId?: string;
  targetItemTitle?: string;
  city: string;
  userId: string;
  userName: string;
  userEmail: string;
  payload: any;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  cityDefault: string;
  contributionsCount: number;
  approvedCount: number;
  reputationLevel: 'iniciante' | 'colaborador_ativo' | 'guardiao_local' | 'admin';
}

export interface ActiveFilters {
  searchQuery: string;
  type?: ItemType | 'all';
  category?: MainCategory | 'all';
  onlyOpenNow: boolean;
  onlyOnDuty: boolean;
  maxDistanceKm?: number;
  sortBy: 'distance' | 'score' | 'reviews' | 'recent';
}

export interface CommercialAd {
  id: string;
  type: 'business' | 'event' | 'promo' | 'sponsor_spot';
  title: string;
  subtitle: string;
  badge: string;
  sponsorName: string;
  imageUrl: string;
  cityId?: string;
  ctaText: string;
  ctaAction: 'details' | 'whatsapp' | 'external' | 'advertise';
  ctaUrl?: string;
  whatsappNumber?: string;
  address?: string;
  highlightOffer?: string;
  dates?: string;
  description?: string;
}

// ==========================================
// LOCALZ — PUBLICIDADE E DESTAQUES PATROCINADOS
// ==========================================

export type SponsoredAdType = 'business' | 'event';

export type SponsoredOfferType =
  | 'product'
  | 'service'
  | 'offer'
  | 'dish'
  | 'experience'
  | 'event'
  | 'ticket'
  | 'attraction';

export type ModerationStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'expired';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'complimentary'
  | 'not_applicable';

export interface AdAuditHistoryEntry {
  action: string;
  performedBy: string;
  date: string;
  note?: string;
}

export interface SponsoredAd {
  id: string;
  type: SponsoredAdType;
  title: string; // Ex: "Combo Bacon + Fritas" ou "Festival Gastronômico"
  subtitle?: string; // Ex: "Acompanha molho da casa e refrigerante lata"
  establishmentOrEventName: string; // Ex: "Hamburgueria São Lourenço"
  targetItemId?: string; // ID opcional do LocalzItem para link direto ao perfil
  category: string; // Ex: "gastronomia", "servicos", "eventos", etc.
  offerType: SponsoredOfferType;
  price?: number; // Ex: 29.90
  originalPrice?: number; // Ex: 38.00 (para mostrar preço riscado em promoção)
  priceNote?: string; // Ex: "por pessoa", "combo casal", "a partir de"
  
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  conditions?: string; // Ex: "Oferta válida até hoje, 22h. Consumo no local ou retirada."
  validityText?: string; // Ex: "Oferta válida até hoje, 22h" ou "12 a 21 de Outubro"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  
  // Segmentação geográfica
  targetCities: string[]; // Ex: ['sao-lourenco-mg', 'all']
  address?: string;
  neighborhood?: string;
  coordinates?: Coordinates;
  
  // Contato & Destino
  phone?: string;
  whatsapp?: string;
  externalUrl?: string;
  googleMapsUrl?: string;
  
  // Moderação Obrigatória (Nenhum anúncio é publicado automaticamente)
  moderationStatus: ModerationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdBy: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt: string;
  updatedAt: string;
  moderationHistory?: AdAuditHistoryEntry[];
  
  // Pagamento (Arquitetura separada, sem cobrança real no MVP)
  paymentStatus: PaymentStatus;
  planDurationDays: number; // Ex: 7, 15, 30
  
  // Métricas de visualização e engajamento
  metrics: {
    impressions: number;
    clicks: number;
    contactClicks: number;
    mapClicks: number;
  };
}
