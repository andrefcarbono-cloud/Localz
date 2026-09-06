import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocalzItem, Coordinates, PharmacyDutyShift, CityConfig } from '../types';
import { calculateDistanceKm, formatDistance, isCurrentlyOpen, isShiftActiveNow, getDirectionsUrl } from '../utils/geoUtils';
import {
  Navigation,
  MapPin,
  Star,
  ExternalLink,
  ChevronRight,
  Cross,
  Utensils,
  Trees,
  Calendar,
  Wrench,
  Search,
  X,
} from 'lucide-react';

interface RealMapViewProps {
  items: LocalzItem[];
  selectedCity: CityConfig;
  userCoords: Coordinates | null;
  activeShifts: PharmacyDutyShift[];
  onSelectItem: (item: LocalzItem) => void;
  onRequestLocation: () => void;
}

export const RealMapView: React.FC<RealMapViewProps> = ({
  items,
  selectedCity,
  userCoords,
  activeShifts,
  onSelectItem,
  onRequestLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeItem, setActiveItem] = useState<LocalzItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Helper to create category-specific SVG marker icon
  const createCustomIcon = (item: LocalzItem, isOnDuty: boolean) => {
    let bgColor = 'bg-emerald-600';
    let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    if (isOnDuty) {
      bgColor = 'bg-rose-600 animate-bounce ring-4 ring-rose-300';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`;
    } else if (item.category === 'saude_farmacia') {
      bgColor = 'bg-rose-500';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`;
    } else if (item.category === 'gastronomia') {
      bgColor = 'bg-amber-600';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2 3v5h2V2z"/><path d="M20 2v10a3 3 0 0 1-3 3h-2"/><path d="M18 15v7"/><path d="M4 2v6a3 3 0 0 0 3 3h2"/><path d="M7 11v11"/></svg>`;
    } else if (item.category === 'turismo_lazer') {
      bgColor = 'bg-teal-600';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/><path d="m14 18-3-3v7"/><path d="m10 18 3-3"/></svg>`;
    } else if (item.type === 'event') {
      bgColor = 'bg-purple-600';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`;
    } else {
      bgColor = 'bg-blue-600';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full ${bgColor} shadow-lg flex items-center justify-center border-2 border-white transition-transform hover:scale-115 cursor-pointer">
            ${iconSvg}
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -36],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedCity.coordinates.lat, selectedCity.coordinates.lng],
        zoom: 14,
        zoomControl: false,
      });

      // CartoDB Voyager Tiles (clean, modern, very legible in Portuguese)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Re-position zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map when component completely unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to selected city coordinates when city changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedCity.coordinates.lat, selectedCity.coordinates.lng], 14);
      setActiveItem(null);
    }
  }, [selectedCity]);

  // Update user GPS location pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 bg-blue-500/30 rounded-full animate-ping"></span>
            <span class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      } else {
        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // Render markers according to filter and items
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredItems = items.filter((item) => {
      if (filterCategory === 'all') return true;
      if (filterCategory === 'duty') {
        const isPharmacy = (item as any).isPharmacy;
        return isPharmacy && activeShifts.some((s) => s.pharmacyId === item.id && isShiftActiveNow(s));
      }
      if (filterCategory === 'open') return isCurrentlyOpen(item);
      return item.category === filterCategory || item.type === filterCategory;
    });

    filteredItems.forEach((item) => {
      if (!item.coordinates || !item.coordinates.lat || !item.coordinates.lng) return;

      const isPharmacy = (item as any).isPharmacy;
      const isOnDuty = isPharmacy && activeShifts.some((s) => s.pharmacyId === item.id && isShiftActiveNow(s));

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: createCustomIcon(item, isOnDuty),
        title: item.title,
      });

      marker.on('click', () => {
        setActiveItem(item);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([item.coordinates.lat, item.coordinates.lng], {
            animate: true,
            duration: 0.5,
          });
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [items, filterCategory, activeShifts]);

  // Center map on user
  const handleCenterUser = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 16);
    } else {
      onRequestLocation();
    }
  };

  // Center map on city center
  const handleCenterCity = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCity.coordinates.lat, selectedCity.coordinates.lng], 14);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[480px] bg-neutral-100 overflow-hidden flex flex-col">
      {/* Top Filter Chips over Map */}
      <div className="absolute top-3 left-3 right-14 z-20 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition ${
            filterCategory === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-white/95 text-neutral-700 hover:bg-white'
          }`}
        >
          Todos ({items.length})
        </button>

        <button
          onClick={() => setFilterCategory('duty')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1 transition ${
            filterCategory === 'duty'
              ? 'bg-rose-600 text-white'
              : 'bg-white/95 text-rose-700 hover:bg-rose-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Plantão Agora
        </button>

        <button
          onClick={() => setFilterCategory('open')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition ${
            filterCategory === 'open'
              ? 'bg-emerald-600 text-white'
              : 'bg-white/95 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          Abertos Agora
        </button>

        <button
          onClick={() => setFilterCategory('gastronomia')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition ${
            filterCategory === 'gastronomia'
              ? 'bg-amber-600 text-white'
              : 'bg-white/95 text-neutral-700 hover:bg-white'
          }`}
        >
          Onde Comer
        </button>

        <button
          onClick={() => setFilterCategory('event')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition ${
            filterCategory === 'event'
              ? 'bg-purple-600 text-white'
              : 'bg-white/95 text-neutral-700 hover:bg-white'
          }`}
        >
          Eventos
        </button>

        <button
          onClick={() => setFilterCategory('turismo_lazer')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition ${
            filterCategory === 'turismo_lazer'
              ? 'bg-teal-600 text-white'
              : 'bg-white/95 text-neutral-700 hover:bg-white'
          }`}
        >
          Lugares
        </button>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute right-3 top-16 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterUser}
          title={userCoords ? 'Centralizar na minha posição' : 'Buscar minha localização'}
          className="w-10 h-10 rounded-full bg-white text-neutral-700 hover:text-blue-600 shadow-md flex items-center justify-center transition border border-neutral-200 hover:border-blue-300"
        >
          <Navigation className={`w-4 h-4 ${userCoords ? 'text-blue-600' : ''}`} />
        </button>

        <button
          onClick={handleCenterCity}
          title="Centralizar na cidade"
          className="w-10 h-10 rounded-full bg-white text-neutral-700 hover:text-emerald-700 shadow-md flex items-center justify-center transition border border-neutral-200"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* The Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Active Item Floating Preview Card */}
      {activeItem && (
        <div className="absolute bottom-4 left-4 right-4 z-30 max-w-lg mx-auto bg-white rounded-2xl p-3 shadow-2xl border border-neutral-200 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start gap-3">
            <img
              src={activeItem.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'}
              alt={activeItem.title}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                  {activeItem.subcategory}
                </span>
                <button
                  onClick={() => setActiveItem(null)}
                  className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-neutral-900 truncate mt-0.5">
                {activeItem.title}
              </h4>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{activeItem.localzScore.toFixed(1)}</span>
                </div>

                {userCoords && (
                  <span className="text-xs font-medium text-neutral-500 flex items-center gap-0.5">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    {formatDistance(calculateDistanceKm(userCoords, activeItem.coordinates))}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-500 truncate mt-1">
                {activeItem.address}
              </p>
            </div>
          </div>

          {/* Card bottom actions */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
            <a
              href={getDirectionsUrl(activeItem.coordinates.lat, activeItem.coordinates.lng, activeItem.title).google}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 flex items-center gap-1 transition"
            >
              <Navigation className="w-3 h-3 text-neutral-600" />
              Como Chegar
            </a>

            <button
              onClick={() => onSelectItem(activeItem)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs"
            >
              Ver Detalhes Completos
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
