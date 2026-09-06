import React, { useState, useEffect } from 'react';
import { SponsoredAd, Coordinates, LocalzItem } from '../types';
import { calculateDistanceKm, formatDistance, getDirectionsUrl } from '../utils/geoUtils';
import { storageService } from '../services/storageService';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Share2,
  Sparkles,
  ShieldAlert,
  Calendar,
  Tag,
  ExternalLink,
  Store,
  Info,
  CheckCircle,
  Flag,
} from 'lucide-react';

interface SponsoredDetailModalProps {
  ad: SponsoredAd | null;
  onClose: () => void;
  userCoords: Coordinates | null;
  onNavigateToOrganicItem?: (itemId: string) => void;
  organicItem?: LocalzItem;
}

export const SponsoredDetailModal: React.FC<SponsoredDetailModalProps> = ({
  ad,
  onClose,
  userCoords,
  onNavigateToOrganicItem,
  organicItem,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [sharedToast, setSharedToast] = useState(false);
  const [reportedToast, setReportedToast] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    if (ad) {
      // Record metric impression on view
      storageService.recordAdMetric(ad.id, 'impressions');
      setActivePhotoIdx(0);
    }
  }, [ad?.id]);

  if (!ad) return null;

  const distanceKm =
    userCoords && ad.coordinates
      ? calculateDistanceKm(userCoords, ad.coordinates)
      : null;

  const allPhotos = [ad.imageUrl, ...(ad.additionalImages || [])];
  const activePhoto = allPhotos[activePhotoIdx] || ad.imageUrl;

  const formattedPrice =
    ad.price !== undefined
      ? ad.price === 0
        ? 'Gratuito'
        : `R$ ${ad.price.toFixed(2).replace('.', ',')}`
      : null;

  const formattedOriginalPrice =
    ad.originalPrice !== undefined
      ? `R$ ${ad.originalPrice.toFixed(2).replace('.', ',')}`
      : null;

  const handleOpenWhatsapp = () => {
    storageService.recordAdMetric(ad.id, 'contactClicks');
    const phone = (ad.whatsapp || ad.phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Vi o anúncio "${ad.title}" no Localz e gostaria de mais informações.`
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const handleOpenMap = () => {
    storageService.recordAdMetric(ad.id, 'mapClicks');
    if (ad.googleMapsUrl) {
      window.open(ad.googleMapsUrl, '_blank');
    } else if (ad.coordinates) {
      const urls = getDirectionsUrl(ad.coordinates.lat, ad.coordinates.lng, ad.title);
      window.open(urls.google, '_blank');
    }
  };

  const handleShare = () => {
    storageService.recordAdMetric(ad.id, 'clicks');
    const shareData = {
      title: `${ad.title} - ${ad.establishmentOrEventName}`,
      text: `Confira este destaque no Localz: ${ad.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2000);
    }
  };

  const handleReportAd = () => {
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setReportedToast(true);
      setTimeout(() => setReportedToast(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 text-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Sticky Header with Title and Close */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/15 border border-amber-400/40 text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              Destaque Patrocinado
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Compartilhar Anúncio"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-0 flex-1">
          {/* Main Large Image */}
          <div className="relative w-full h-64 sm:h-80 bg-zinc-900">
            <img
              src={activePhoto}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

            {/* Thumbnail Gallery (if more than 1 image) */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      activePhotoIdx === idx
                        ? 'border-amber-400 scale-105'
                        : 'border-white/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Title & Establishment */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                  {ad.establishmentOrEventName}
                </span>
                {distanceKm !== null && (
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {formatDistance(distanceKm)}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {ad.title}
              </h2>

              {ad.subtitle && (
                <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
                  {ad.subtitle}
                </p>
              )}
            </div>

            {/* Price Box */}
            {formattedPrice && (
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wide">
                    Valor da Oferta
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-amber-400">
                      {formattedPrice}
                    </span>
                    {formattedOriginalPrice && (
                      <span className="text-sm text-zinc-500 line-through font-semibold">
                        {formattedOriginalPrice}
                      </span>
                    )}
                    {ad.priceNote && (
                      <span className="text-xs text-zinc-300 font-medium">
                        ({ad.priceNote})
                      </span>
                    )}
                  </div>
                </div>

                {ad.validityText && (
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Validade
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 mt-0.5 block">
                      {ad.validityText}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Conditions / Restrictions */}
            {ad.conditions && (
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Condições & Regras da Promoção
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {ad.conditions}
                  </p>
                </div>
              </div>
            )}

            {/* Complete Description */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Sobre este Destaque
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {ad.description}
              </p>
            </div>

            {/* Location & Address Info */}
            {ad.address && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-xs font-bold text-zinc-400 block uppercase">
                      Localização
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {ad.address}
                    </span>
                    {ad.neighborhood && (
                      <span className="text-xs text-zinc-400 block">
                        Bairro {ad.neighborhood}
                      </span>
                    )}
                  </div>
                </div>

                {ad.coordinates && (
                  <button
                    onClick={handleOpenMap}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Abrir no Mapa / Como Chegar
                  </button>
                )}
              </div>
            )}

            {/* Link to Organic Profile on Localz */}
            {organicItem && onNavigateToOrganicItem && (
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Perfil Completo no Localz
                    </h5>
                    <p className="text-[11px] text-zinc-400">
                      Veja horários de funcionamento, cardápio e avaliações orgânicas.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToOrganicItem(organicItem.id);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition"
                >
                  Ver Perfil
                </button>
              </div>
            )}

            {/* Legal / Localz Score Transparency Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300 font-semibold block mb-0.5">
                  Transparência Localz:
                </strong>
                Este é um conteúdo patrocinado. Pagamentos compram exclusivamente visibilidade no topo e vitrines locais, nunca reputação. A publicidade não altera avaliações, resenhas de usuários ou o Localz Score.
              </div>
            </div>

            {/* Community Safety & Report Button */}
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Anúncio ID: {ad.id}</span>
              <button
                onClick={handleReportAd}
                disabled={isReporting || reportedToast}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition"
              >
                <Flag className="w-3.5 h-3.5" />
                {reportedToast ? 'Denúncia enviada à moderação' : 'Denunciar anúncio'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar (Sticky) */}
        <div className="sticky bottom-0 z-30 p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 flex items-center gap-3">
          {(ad.whatsapp || ad.phone) && (
            <button
              onClick={handleOpenWhatsapp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4" />
              Conversar no WhatsApp
            </button>
          )}

          {ad.phone && !ad.whatsapp && (
            <a
              href={`tel:${ad.phone}`}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              Ligar Agora
            </a>
          )}

          {ad.externalUrl && (
            <a
              href={ad.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Site Oficial
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
