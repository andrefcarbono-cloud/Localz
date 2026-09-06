import React, { useState } from 'react';
import { CityConfig, Coordinates } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geoUtils';
import { MapPin, Navigation, Check, X, Search, ShieldCheck } from 'lucide-react';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityConfig[];
  selectedCity: CityConfig;
  userCoords: Coordinates | null;
  onSelectCity: (city: CityConfig) => void;
  onRequestLocation: () => void;
  locationLoading: boolean;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  cities,
  selectedCity,
  userCoords,
  onSelectCity,
  onRequestLocation,
  locationLoading,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()) ||
      c.stateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Selecionar Cidade</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Escolha a cidade para ver eventos, comércios e plantões
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS location trigger banner */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/80">
          <button
            onClick={onRequestLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-300 shadow-xs text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <span className="text-sm font-semibold text-neutral-900 block">
                  Usar minha localização atual
                </span>
                <span className="text-xs text-neutral-500">
                  {userCoords ? 'GPS ativo — calcula distância real' : 'Detectar cidade mais próxima por GPS'}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-md">
              {locationLoading ? 'Buscando...' : 'Ativar'}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-neutral-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar município ou estado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100/80 border border-neutral-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              autoFocus
            />
          </div>
        </div>

        {/* Cities list */}
        <div className="overflow-y-auto divide-y divide-neutral-100 flex-1 p-2">
          {filteredCities.map((city) => {
            const isSelected = city.id === selectedCity.id;
            const distance = userCoords ? calculateDistanceKm(userCoords, city.coordinates) : null;

            return (
              <button
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl flex items-center justify-between transition ${
                  isSelected ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{city.name}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-neutral-200/70 text-neutral-700">
                        {city.state}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {city.population ? `${city.population.toLocaleString('pt-BR')} hab.` : city.stateName} •{' '}
                      <span className="text-neutral-600 font-medium">
                        {city.dutyModel === 'rotation' ? 'Rodízio de Plantão' : 'Escala Definida'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {distance !== null && (
                    <span className="text-xs text-neutral-500 font-medium">
                      {formatDistance(distance)}
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="py-8 text-center px-4">
              <p className="text-sm text-neutral-500">Nenhum município encontrado com "{search}".</p>
              <p className="text-xs text-neutral-400 mt-1">
                Você pode sugerir a inclusão da sua cidade pelo botão de colaboração.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Dados locais atualizados e verificados pela moderação
          </p>
        </div>
      </div>
    </div>
  );
};
