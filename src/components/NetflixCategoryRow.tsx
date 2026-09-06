import React, { useRef } from 'react';
import { LocalzItem, Coordinates } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geoUtils';
import { Star, ChevronLeft, ChevronRight, Navigation, CheckCircle2, Clock } from 'lucide-react';

interface NetflixCategoryRowProps {
  title: string;
  subtitle?: string;
  items: LocalzItem[];
  userCoords: Coordinates | null;
  onSelectItem: (item: LocalzItem) => void;
  badgeText?: string;
}

export const NetflixCategoryRow: React.FC<NetflixCategoryRowProps> = ({
  title,
  subtitle,
  items,
  userCoords,
  onSelectItem,
  badgeText,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="relative w-full py-4 group/row">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-0 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {title}
            </h3>
            {badgeText && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-1 py-2 scroll-smooth"
      >
        {items.map((item) => {
          const photo = item.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
          const distanceKm = userCoords ? calculateDistanceKm(userCoords, item.coordinates) : null;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="relative shrink-0 w-60 sm:w-68 rounded-xl overflow-hidden bg-[#141417] border border-zinc-800/80 hover:border-red-600/70 hover:shadow-xl hover:shadow-red-950/30 transition-all duration-300 cursor-pointer group flex flex-col transform hover:-translate-y-1"
            >
              {/* Image Preview with 16:9 ratio */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-900">
                <img
                  src={photo}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-transparent to-black/40" />

                {/* Badges on Image */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-red-600 px-1.5 py-0.5 rounded shadow-sm">
                    {item.subcategory || item.mainCategory}
                  </span>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-black backdrop-blur-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.localzScore.toFixed(1)}</span>
                </div>

                {distanceKm !== null && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-zinc-300 text-[10px] font-semibold backdrop-blur-sm">
                    {formatDistance(distanceKm)}
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="truncate max-w-[70%]">{item.address.split(',')[0]}</span>
                  <span className="text-red-500 font-bold hover:underline shrink-0">
                    Detalhes &gt;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
