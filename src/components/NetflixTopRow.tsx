import React, { useRef } from 'react';
import { LocalzItem, Coordinates } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geoUtils';
import { Star, ChevronLeft, ChevronRight, Navigation, CheckCircle2, Flame } from 'lucide-react';

interface NetflixTopRowProps {
  title: string;
  items: LocalzItem[];
  userCoords: Coordinates | null;
  onSelectItem: (item: LocalzItem) => void;
}

export const NetflixTopRow: React.FC<NetflixTopRowProps> = ({
  title,
  items,
  userCoords,
  onSelectItem,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Sort top items by rating or review count
  const topItems = [...items]
    .sort((a, b) => b.localzScore - a.localzScore || b.reviewCount - a.reviewCount)
    .slice(0, 10);

  if (topItems.length === 0) return null;

  return (
    <div className="relative w-full py-4 group/section">
      {/* Row Header */}
      <div className="flex items-center justify-between px-4 sm:px-0 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
              Top 10
            </span>
          </h2>
        </div>

        {/* Navigation Arrows (Desktop) */}
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
        className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-1 py-4 scroll-smooth"
      >
        {topItems.map((item, index) => {
          const rank = index + 1;
          const photo = item.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
          const distanceKm = userCoords ? calculateDistanceKm(userCoords, item.coordinates) : null;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="relative shrink-0 flex items-end cursor-pointer select-none group transition-all duration-300 transform hover:-translate-y-2"
              style={{ width: '220px' }}
            >
              {/* Giant Netflix Outline Rank Number (1, 2, 3, 4, 5...) */}
              <div className="relative -mr-6 z-0 pointer-events-none select-none">
                <svg
                  className="w-24 h-44 sm:w-28 sm:h-52 overflow-visible"
                  viewBox="0 0 100 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="50%"
                    y="130"
                    textAnchor="middle"
                    className="font-black text-[140px]"
                    fill="#0a0a0c"
                    stroke="#404048"
                    strokeWidth="6"
                    strokeLinejoin="round"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 900,
                    }}
                  >
                    {rank}
                  </text>
                  <text
                    x="50%"
                    y="130"
                    textAnchor="middle"
                    className="font-black text-[140px] group-hover:stroke-red-600 transition-colors duration-300"
                    fill="#0a0a0c"
                    stroke="#404048"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 900,
                    }}
                  >
                    {rank}
                  </text>
                </svg>
              </div>

              {/* Poster Card (Vertical ratio like Netflix) */}
              <div className="relative z-10 w-36 sm:w-40 aspect-2/3 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600/80 group-hover:shadow-2xl group-hover:shadow-red-950/50 transition-all duration-300 flex flex-col justify-between">
                {/* Background Image */}
                <img
                  src={photo}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

                {/* Top Badge: "LOCALZ" brand & rank */}
                <div className="relative z-10 p-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-black/80 px-1.5 py-0.5 rounded backdrop-blur-md">
                    LOCALZ
                  </span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[11px] font-black backdrop-blur-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.localzScore.toFixed(1)}</span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-red-400 block truncate">
                    {item.subcategory || item.mainCategory}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="truncate">{item.address.split(',')[0]}</span>
                    {distanceKm !== null && (
                      <span className="text-zinc-300 font-bold shrink-0 ml-1">
                        {formatDistance(distanceKm)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
