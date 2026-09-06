import React, { useState } from 'react';
import { CityConfig, Coordinates, UserProfile } from '../types';
import {
  MapPin,
  ChevronDown,
  Navigation,
  Search,
  Plus,
  Shield,
  X,
  EyeOff,
  User,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  selectedCity: CityConfig;
  userCoords: Coordinates | null;
  onOpenCitySelector: () => void;
  onRequestLocation: () => void;
  locationLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenContributeModal: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenThemeModal?: () => void;
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
  isVisible?: boolean;
  onToggleImmersive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCity,
  userCoords,
  onOpenCitySelector,
  onRequestLocation,
  locationLoading,
  searchQuery,
  onSearchChange,
  onOpenContributeModal,
  onOpenPrivacyModal,
  onOpenSettingsModal,
  onOpenThemeModal,
  currentUser,
  onOpenProfile,
  isVisible = true,
  onToggleImmersive,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Glass Surface */}
      <div className="relative bg-zinc-950/85 dark:bg-black/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.65)] transition-colors">
        {/* Subtle glowing ambient accent line on top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/60 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-2.5">
          {/* Row 1: Brand, City Selector, and Sleek Action Controls */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand Logo & City Selector */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand Logo with Cinema Glow */}
              <div
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 shrink-0 cursor-pointer group"
                title="Voltar ao topo"
              >
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(229,9,20,0.45)] group-hover:shadow-[0_0_22px_rgba(229,9,20,0.7)] group-hover:scale-105 transition-all duration-200">
                  <span>L</span>
                  {/* Glass reflection sheen */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-black text-lg text-white tracking-tight block leading-none drop-shadow-sm">
                    LOCAL<span className="text-[#e50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]">Z</span>
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mt-0.5">
                    Cidades Brasileiras
                  </span>
                </div>
              </div>

              {/* City Selector Pill with Glassmorphism */}
              <button
                onClick={onOpenCitySelector}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 text-zinc-100 text-xs font-bold transition-all duration-200 border border-white/12 hover:border-white/25 truncate shadow-xs group cursor-pointer"
                title="Trocar de cidade"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#e50914] group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[130px] sm:max-w-none">
                  {selectedCity.name}, {selectedCity.state}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
              </button>
            </div>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Geolocation GPS Pill */}
              <button
                onClick={onRequestLocation}
                disabled={locationLoading}
                title={userCoords ? 'GPS ativo' : 'Ativar localização por GPS'}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  userCoords
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                {userCoords ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                ) : (
                  <Navigation
                    className={`w-3.5 h-3.5 text-zinc-400 ${
                      locationLoading ? 'animate-spin text-red-500' : ''
                    }`}
                  />
                )}
                <span className="hidden md:inline text-[11px] font-medium">
                  {userCoords ? 'GPS Ativo' : 'Usar GPS'}
                </span>
              </button>

              {/* Collaborative Add Button with Neon Accent */}
              <button
                onClick={onOpenContributeModal}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_16px_rgba(229,9,20,0.35)] hover:shadow-[0_0_24px_rgba(229,9,20,0.5)] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Colaborar</span>
              </button>

              {/* User Profile Button */}
              <button
                onClick={onOpenProfile}
                title={
                  currentUser
                    ? `Perfil: ${currentUser.name} (${currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'moderator' ? 'Moderador' : 'Colaborador'})`
                    : 'Meu Perfil'
                }
                className="flex items-center gap-2 py-1 pl-1 pr-1.5 sm:pr-2.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/12 hover:border-white/25 transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <div className="relative flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-red-500/60 transition-all"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-red-600 to-zinc-800 text-white flex items-center justify-center text-[11px] font-black ring-1 ring-white/20">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  {/* Status / Role Indicator Dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-950 ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-400 ring-1 ring-amber-500/50'
                        : currentUser?.role === 'moderator'
                        ? 'bg-blue-400 ring-1 ring-blue-500/50'
                        : 'bg-emerald-400 ring-1 ring-emerald-500/50'
                    }`}
                  />
                </div>

                <div className="hidden sm:flex flex-col items-start text-left leading-none">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[80px]">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'Perfil'}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-medium capitalize mt-0.5">
                    {currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'moderator' ? 'Mod' : 'Membro'}
                  </span>
                </div>
              </button>

              {/* Immersive / Hide Menus Button */}
              {onToggleImmersive && (
                <button
                  onClick={onToggleImmersive}
                  title="Modo Imersivo (Ocultar Menus)"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer hidden xs:flex items-center justify-center"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}

              {/* Settings button */}
              <button
                onClick={onOpenSettingsModal || onOpenPrivacyModal}
                id="navbar-settings-button"
                title="Configurações"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center group"
              >
                <Settings className="w-4 h-4 text-zinc-300 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* Row 2: Search Command Input Bar */}
          <div className="mt-2.5 relative">
            <div
              className={`relative flex items-center rounded-xl transition-all duration-200 ${
                isSearchFocused
                  ? 'bg-zinc-900/90 border border-red-500/60 shadow-[0_0_20px_rgba(229,9,20,0.25)] ring-1 ring-red-500/30'
                  : 'bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20'
              }`}
            >
              <Search
                className={`w-4 h-4 absolute left-3.5 transition-colors ${
                  isSearchFocused ? 'text-[#e50914]' : 'text-zinc-400'
                }`}
              />
              <input
                type="text"
                placeholder={`Buscar estabelecimentos, farmácias, eventos ou lugares em ${selectedCity.name}...`}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-transparent text-white placeholder-zinc-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
