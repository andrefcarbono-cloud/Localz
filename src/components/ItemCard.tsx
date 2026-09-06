import React from 'react';
import { LocalzItem, Coordinates, PharmacyDutyShift } from '../types';
import { calculateDistanceKm, formatDistance, isCurrentlyOpen, isShiftActiveNow, getDirectionsUrl } from '../utils/geoUtils';
import {
  Star,
  MapPin,
  Clock,
  Heart,
  Navigation,
  Calendar,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ItemCardProps {
  item: LocalzItem;
  userCoords: Coordinates | null;
  activeShifts: PharmacyDutyShift[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (item: LocalzItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  userCoords,
  activeShifts,
  isFavorite,
  onToggleFavorite,
  onClick,
}) => {
  const distanceKm = userCoords ? calculateDistanceKm(userCoords, item.coordinates) : null;
  const isOpen = isCurrentlyOpen(item);

  // Check if item is an on-duty pharmacy right now
  const isPharmacy = (item as any).isPharmacy;
  const isOnDutyNow = isPharmacy && activeShifts.some((s) => s.pharmacyId === item.id && isShiftActiveNow(s));

  // Primary photo
  const photo = item.photos && item.photos.length > 0
    ? item.photos[0]
    : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

  const directions = getDirectionsUrl(item.coordinates.lat, item.coordinates.lng, item.title);

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image container with badges */}
      <div className="relative aspect-16/9 w-full bg-neutral-100 dark:bg-zinc-800 overflow-hidden">
        <img
          src={photo}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center max-w-[80%]">
          {/* Duty Pharmacy Special Badge */}
          {isOnDutyNow && (
            <span
              style={{ backgroundColor: 'var(--theme-duty)' }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              DE PLANTÃO AGORA
            </span>
          )}

          {/* 24 Hours */}
          {(item as any).is24h && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
              24 HORAS
            </span>
          )}

          {/* Open / Closed Status (when not plantão or in addition) */}
          {!isOnDutyNow && !(item as any).is24h && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                isOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800/80 backdrop-blur-xs text-neutral-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-200' : 'bg-neutral-400'}`} />
              {isOpen ? 'ABERTO AGORA' : 'FECHADO'}
            </span>
          )}

          {/* Event Status */}
          {item.type === 'event' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-xs">
              <Calendar className="w-3 h-3" />
              {item.eventStatus === 'happening_now' ? 'ACONTECENDO' : 'EVENTO'}
            </span>
          )}

          {/* Sponsored Badge */}
          {item.isSponsored && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              PATROCINADO
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label="Favoritar"
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
        >
          <Heart
            className={`w-4 h-4 transition ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
          />
        </button>

        {/* Bottom image overlay: Distance & Subcategory */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold drop-shadow-sm text-neutral-100 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {item.subcategory}
          </span>
          {distanceKm !== null && (
            <span className="flex items-center gap-1 font-bold bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md drop-shadow-sm">
              <Navigation className="w-3 h-3 text-emerald-400" />
              {formatDistance(distanceKm)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Localz Score */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-neutral-900 dark:text-zinc-100 text-base leading-snug line-clamp-1 transition">
              {item.title}
            </h3>

            {/* Localz Score Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-zinc-100 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-extrabold">{item.localzScore.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-600 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>

          {/* Event extra info */}
          {item.type === 'event' && (
            <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-2 rounded-lg">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {item.startDate ? `Data: ${item.startDate.split('-').reverse().join('/')}` : ''} às {item.startTime}
                {item.isFree ? ' • Entrada Gratuita' : ` • ${item.ticketPrice || 'Ingresso Pago'}`}
              </span>
            </div>
          )}

          {/* Address */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 dark:text-zinc-500 shrink-0" />
            <span className="truncate">{item.address}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-zinc-400">
            {item.verificationStatus === 'verified' && (
              <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--theme-primary)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Oficial
              </span>
            )}
            {item.verificationStatus === 'community' && (
              <span className="text-neutral-500 dark:text-zinc-400">Comunitário</span>
            )}
            <span>•</span>
            <span>{item.reviewCount} avaliaç{item.reviewCount === 1 ? 'ão' : 'ões'}</span>
          </div>

          <a
            href={directions.google}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-zinc-200 hover:text-emerald-700 dark:hover:text-emerald-400 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition"
          >
            <Navigation className="w-3 h-3" />
            Rotas
          </a>
        </div>
      </div>
    </div>
  );
};
