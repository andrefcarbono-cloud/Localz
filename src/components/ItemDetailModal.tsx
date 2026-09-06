import React, { useState } from 'react';
import { LocalzItem, Coordinates, Review, PharmacyDutyShift, UserProfile } from '../types';
import { calculateDistanceKm, formatDistance, isCurrentlyOpen, isShiftActiveNow, getDirectionsUrl } from '../utils/geoUtils';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Globe,
  Instagram,
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  Calendar,
  Ticket,
  Sparkles,
  UserCheck,
  Flag,
  PenSquare,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: LocalzItem | null;
  onClose: () => void;
  userCoords: Coordinates | null;
  activeShifts: PharmacyDutyShift[];
  reviews: Review[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenReviewModal: (item: LocalzItem) => void;
  currentUser: UserProfile;
  onOpenPromoteModal?: (item: LocalzItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  userCoords,
  activeShifts,
  reviews,
  isFavorite,
  onToggleFavorite,
  onOpenReviewModal,
  currentUser,
  onOpenPromoteModal,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  if (!item) return null;

  const distanceKm = userCoords ? calculateDistanceKm(userCoords, item.coordinates) : null;
  const isOpen = isCurrentlyOpen(item);
  const isPharmacy = (item as any).isPharmacy;
  const isOnDuty = isPharmacy && activeShifts.some((s) => s.pharmacyId === item.id && isShiftActiveNow(s));

  const directions = getDirectionsUrl(item.coordinates.lat, item.coordinates.lng, item.title);
  const photos = item.photos && item.photos.length > 0
    ? item.photos
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'];

  const currentDayOfWeek = new Date().getDay();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${item.address}, ${item.city} - ${item.state}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Confira ${item.title} no Localz`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom duration-200 my-auto">
        {/* Modal Top Bar for Mobile */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              {item.subcategory}
            </span>
            {item.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verificado Oficial
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Compartilhar"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(item.id)}
              aria-label="Favoritar"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pb-6">
          {/* Main Photo Carousel / Hero */}
          <div className="relative aspect-16/10 w-full bg-neutral-900 overflow-hidden">
            <img
              src={photos[activePhotoIdx]}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
              {isOnDuty && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg animate-pulse">
                  DE PLANTÃO AGORA
                </span>
              )}
              {(item as any).is24h && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm">
                  24 HORAS
                </span>
              )}
              {!isOnDuty && !(item as any).is24h && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                    isOpen ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-200'
                  }`}
                >
                  {isOpen ? 'ABERTO AGORA' : 'FECHADO'}
                </span>
              )}
              {item.isSponsored && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  PATROCINADO
                </span>
              )}
            </div>

            {/* Thumbnail dots if multiple photos */}
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activePhotoIdx ? 'w-5 bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Primary Header Info */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-neutral-900 leading-tight">
                  {item.title}
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  {item.category.replace('_', ' ').toUpperCase()} • {item.city}, {item.state}
                </p>
              </div>

              {/* Localz Score Box */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="text-lg font-black">{item.localzScore.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                  Localz Score ({item.reviewCount} avaliações)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              {item.description}
            </p>

            {/* Quick Action Navigation & Contact Buttons */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={directions.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                Como Chegar
              </a>

              {item.phone && (
                <a
                  href={`tel:${item.phone.replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Ligar
                </a>
              )}

              {item.whatsapp && (
                <a
                  href={`https://wa.me/${item.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}

              {item.instagram && (
                <a
                  href={`https://instagram.com/${item.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 text-xs font-bold transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </a>
              )}
            </div>

            {/* Address bar with distance and copy */}
            <div className="mt-5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-neutral-900 block truncate">
                    {item.address}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {item.neighborhood ? `${item.neighborhood} • ` : ''}
                    {item.city}, {item.state}
                    {distanceKm !== null && ` (${formatDistance(distanceKm)} de você)`}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyAddress}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg shrink-0 transition"
              >
                {copiedAddress ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            {/* Specific Event Information */}
            {item.type === 'event' && (
              <div className="mt-5 p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>
                    Data: {item.startDate?.split('-').reverse().join('/')} às {item.startTime}
                    {item.endDate && ` até ${item.endDate.split('-').reverse().join('/')}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-700" />
                  <span>{item.isFree ? 'Entrada Gratuita' : `Ingresso: ${item.ticketPrice || 'Consultar'}`}</span>
                </div>
                {item.organizerName && (
                  <div className="flex items-center gap-2 text-[11px] text-purple-800">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Organizador: {item.organizerName} (Reputação {item.organizerReputationScore || '9.0'})</span>
                  </div>
                )}
                {item.recurrence && item.recurrence !== 'none' && (
                  <p className="text-[11px] text-purple-700 font-medium">
                    Recorrência: {item.recurrenceDetails || item.recurrence}
                  </p>
                )}
              </div>
            )}

            {/* Opening Hours Table for Business & Places */}
            {(item as any).openingHours && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Horários de Funcionamento
                </h3>
                <div className="bg-neutral-50 rounded-xl border border-neutral-200/80 p-3 divide-y divide-neutral-200/60 text-xs">
                  {((item as any).openingHours as any[]).map((h) => {
                    const isToday = h.dayOfWeek === currentDayOfWeek;
                    return (
                      <div
                        key={h.dayOfWeek}
                        className={`py-1.5 flex items-center justify-between ${
                          isToday ? 'font-bold text-emerald-800 bg-emerald-50/60 px-2 rounded-md' : 'text-neutral-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {h.dayName}
                          {isToday && <span className="text-[10px] text-emerald-600">(Hoje)</span>}
                        </span>
                        <span>
                          {!h.isOpen
                            ? 'Fechado'
                            : h.is24h
                            ? '24 horas'
                            : h.periods
                            ? h.periods.map((p: any) => `${p.open} às ${p.close}`).join(' / ')
                            : 'Aberto'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Amenities & Tags */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Destaques & Facilidades
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {((item as any).amenities || []).map((amenity: string, idx: number) => (
                  <span
                    key={`am-${idx}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification & Ownership Claim Section */}
            <div className="mt-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-900">
                    Origem do Perfil:{' '}
                    {item.verificationStatus === 'verified' && 'Oficial Verificado'}
                    {item.verificationStatus === 'community' && 'Cadastrado pela Comunidade'}
                    {item.verificationStatus === 'claimed' && 'Reivindicado pelo Proprietário'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    É o dono deste estabelecimento? Reivindique para gerenciar informações oficiais.
                  </p>
                </div>
              </div>
              <button
                onClick={() => alert('Solicitação de reivindicação enviada para análise da moderação Localz!')}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition shrink-0"
              >
                Reivindicar Perfil
              </button>
            </div>

            {/* SPONSORED HIGHLIGHT CTA */}
            {onOpenPromoteModal && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      Promover este local no topo do Localz
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                      Destaque ofertas, produtos ou eventos para toda a cidade. Pagamento compra visibilidade, nunca reputação ou pontuação.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onOpenPromoteModal(item);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Criar Anúncio
                </button>
              </div>
            )}

            {/* REVIEWS & LOCALZ SCORE BREAKDOWN */}
            <div className="mt-6 pt-5 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Avaliações da Comunidade ({reviews.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Localz Score calculado por critérios objetivos e imune a pagamentos
                  </p>
                </div>
                <button
                  onClick={() => onOpenReviewModal(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  Avaliar
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              {rev.userName}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {rev.createdAt.split('T')[0].split('-').reverse().join('/')}
                              {rev.verifiedVisit && ' • Visita confirmada'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-extrabold">{rev.overallRating}</span>
                        </div>
                      </div>

                      {/* Dimensional ratings pills */}
                      {rev.dimensions && rev.dimensions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rev.dimensions.map((dim, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 text-neutral-700"
                            >
                              {dim.label}: <strong>{dim.rating}/5</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-neutral-700 mt-2 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    Ainda não há avaliações para este local. Seja o primeiro a avaliar!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
