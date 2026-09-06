import React from 'react';
import { SponsoredAd, Coordinates } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geoUtils';
import {
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  Tag,
  Calendar,
  Info,
  ChevronRight,
} from 'lucide-react';

interface SponsoredCardProps {
  ad: SponsoredAd;
  userCoords: Coordinates | null;
  onClick: (ad: SponsoredAd) => void;
  variant?: 'featured' | 'compact' | 'horizontal';
}

export const SponsoredCard: React.FC<SponsoredCardProps> = ({
  ad,
  userCoords,
  onClick,
  variant = 'featured',
}) => {
  const distanceKm =
    userCoords && ad.coordinates
      ? calculateDistanceKm(userCoords, ad.coordinates)
      : null;

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

  const offerTypeLabels: Record<string, string> = {
    product: 'Produto',
    service: 'Serviço',
    offer: 'Oferta Especial',
    dish: 'Gastronomia',
    experience: 'Experiência',
    event: 'Evento & Atração',
    ticket: 'Ingressos',
    attraction: 'Atração Local',
  };

  return (
    <article
      id={`sponsored-card-${ad.id}`}
      onClick={() => onClick(ad)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-amber-500/25 hover:border-amber-400/60 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
    >
      {/* Top Banner Notice: Imune a Localz Score */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/40 text-[11px] font-black text-amber-300 tracking-wide shadow-sm">
        <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
        <span className="uppercase font-extrabold tracking-wider">Patrocinado</span>
      </div>

      {/* Offer Type Badge (Right Top) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-zinc-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700/70 text-[11px] font-semibold text-zinc-200 shadow-sm">
        <Tag className="w-2.5 h-2.5 text-zinc-400" />
        <span>{offerTypeLabels[ad.offerType] || 'Destaque'}</span>
      </div>

      {/* Large Main Image */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-zinc-950">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

        {/* Validity Floating Pill */}
        {ad.validityText && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-zinc-700/60 text-xs font-semibold text-amber-300">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[220px]">{ad.validityText}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Establishment / Event Name */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 truncate">
              {ad.establishmentOrEventName}
            </span>
            {distanceKm !== null && (
              <span className="text-[11px] font-medium text-zinc-400 shrink-0 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-zinc-500" />
                {formatDistance(distanceKm)}
              </span>
            )}
          </div>

          {/* Short Title */}
          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors line-clamp-1 leading-snug">
            {ad.title}
          </h3>

          {/* Subtitle / Headline */}
          {ad.subtitle && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-normal">
              {ad.subtitle}
            </p>
          )}
        </div>

        {/* Price & Call to Action Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            {formattedPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-amber-400">
                  {formattedPrice}
                </span>
                {formattedOriginalPrice && (
                  <span className="text-xs text-zinc-500 line-through">
                    {formattedOriginalPrice}
                  </span>
                )}
                {ad.priceNote && (
                  <span className="text-[10px] text-zinc-400 font-medium ml-1">
                    {ad.priceNote}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-zinc-300">
                Consulte condições
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>Ver detalhes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
};
