import React from 'react';
import { Compass, Map, ShieldAlert, Heart, Shield, EyeOff, ChevronDown } from 'lucide-react';

export type MainNavTab = 'discover' | 'map' | 'duty' | 'favorites' | 'admin';

interface BottomNavProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  favoritesCount: number;
  hasActiveDuty: boolean;
  isAdmin: boolean;
  isVisible?: boolean;
  onHideNav?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  hasActiveDuty,
  isAdmin,
  isVisible = true,
  onHideNav,
}) => {
  const tabs = [
    {
      id: 'discover' as MainNavTab,
      label: 'Descobrir',
      icon: Compass,
    },
    {
      id: 'map' as MainNavTab,
      label: 'Mapa',
      icon: Map,
    },
    {
      id: 'duty' as MainNavTab,
      label: 'Plantão',
      icon: ShieldAlert,
      badge: hasActiveDuty,
      isDuty: true,
    },
    {
      id: 'favorites' as MainNavTab,
      label: 'Salvos',
      icon: Heart,
      count: favoritesCount,
    },
    {
      id: 'admin' as MainNavTab,
      label: isAdmin ? 'Gestão' : 'Perfil',
      icon: Shield,
    },
  ];

  return (
    <nav
      className={`fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out max-w-md w-[calc(100%-1.5rem)] sm:w-auto ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      {/* Floating Island Capsule */}
      <div className="relative flex items-center justify-between sm:justify-center gap-1 sm:gap-2 px-2.5 py-1.5 rounded-2xl bg-zinc-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)]">
        {/* Specular highlight border on top */}
        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 sm:px-4 rounded-xl transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'text-white bg-gradient-to-b from-white/12 to-white/5 border border-white/15 shadow-[0_0_15px_rgba(229,9,20,0.35)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? tab.isDuty
                        ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)] stroke-[2.5]'
                        : 'text-[#e50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.8)] stroke-[2.5]'
                      : ''
                  }`}
                />

                {/* Duty Live Radar Ping */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,1)]" />
                  </span>
                )}

                {/* Saved Items Counter Badge */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#e50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.6)]">
                    {tab.count}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? 'font-bold text-white' : 'font-medium text-zinc-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Radiant active dot underneath */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#e50914] shadow-[0_0_6px_rgba(229,9,20,0.9)]" />
              )}
            </button>
          );
        })}

        {/* Quick Minimize / Hide Handle */}
        {onHideNav && (
          <button
            onClick={onHideNav}
            title="Ocultar menu (ou arraste a tela para baixo)"
            className="p-1.5 ml-0.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
};
