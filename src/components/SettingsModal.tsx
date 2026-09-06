import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  User,
  MapPin,
  Navigation,
  Bell,
  Palette,
  ShieldCheck,
  Database,
  Trash2,
  Info,
  ChevronRight,
  Check,
  ExternalLink,
  Shield,
  RefreshCw,
  AlertTriangle,
  Smartphone,
  Compass,
} from 'lucide-react';
import { CityConfig, Coordinates, UserProfile } from '../types';
import { storageService, AppSettings } from '../services/storageService';
import { ThemeId, THEME_OPTIONS } from '../services/themeService';

export type SettingsSection =
  | 'all'
  | 'account'
  | 'location'
  | 'notifications'
  | 'appearance'
  | 'privacy'
  | 'data'
  | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  selectedCity: CityConfig;
  userCoords: Coordinates | null;
  locationLoading: boolean;
  currentTheme: ThemeId;
  initialSection?: SettingsSection;
  onOpenCitySelector: () => void;
  onRequestLocation: () => void;
  onClearLocation?: () => void;
  onSelectTheme: (theme: ThemeId) => void;
  onOpenThemeModal?: () => void;
  onOpenProfileModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedCity,
  userCoords,
  locationLoading,
  currentTheme,
  initialSection = 'all',
  onOpenCitySelector,
  onRequestLocation,
  onClearLocation,
  onSelectTheme,
  onOpenThemeModal,
  onOpenProfileModal,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>('default');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync initial section when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection || 'all');
      setAppSettings(storageService.getSettings());
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setBrowserNotificationStatus(Notification.permission);
      }
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleToggleNotification = (
    key: keyof AppSettings['notifications']
  ) => {
    const updated: AppSettings = {
      ...appSettings,
      notifications: {
        ...appSettings.notifications,
        [key]: !appSettings.notifications[key],
      },
    };
    setAppSettings(updated);
    storageService.saveSettings(updated);
    showFeedback('Preferências de notificação salvas com sucesso.');
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationStatus(permission);
        if (permission === 'granted') {
          showFeedback('Permissão do navegador concedida!');
        } else {
          showFeedback('Permissão de notificação negada pelo navegador.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'Deseja realmente limpar todos os dados locais salvos (favoritos, avaliações locais, rascunhos e cache)? Isso restaurará o Localz para o estado inicial.'
      )
    ) {
      storageService.resetAll();
    }
  };

  const sections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Todas', icon: Settings },
    { id: 'account', label: 'Conta', icon: User },
    { id: 'location', label: 'Localização', icon: MapPin },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'privacy', label: 'Privacidade & LGPD', icon: ShieldCheck },
    { id: 'data', label: 'Conta & Dados', icon: Database },
    { id: 'about', label: 'Sobre', icon: Info },
  ];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="settings-modal-container"
        className="w-full max-w-2xl bg-zinc-950 text-white rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                Configurações
              </h2>
              <p className="text-[11px] text-zinc-400">
                Conta, preferências, privacidade e informações do Localz
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-settings-modal-btn"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar configurações"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Feedback */}
        {feedbackMsg && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Section Navigation Pills (Mobile horizontal scroll) */}
        <div className="px-4 py-2 border-b border-white/8 bg-black/40 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/8'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-zinc-200">
          {/* ================================================================= */}
          {/* SECTION: CONTA */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'account') && (
            <section id="settings-section-account" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <User className="w-4 h-4 text-[#e50914]" />
                  <span>Conta & Perfil</span>
                </div>
                {onOpenProfileModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfileModal();
                    }}
                    className="text-xs text-[#e50914] hover:text-rose-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Gestão</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* User Profile Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-zinc-800 text-white flex items-center justify-center text-lg font-black ring-2 ring-red-500/50">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm truncate">
                        {currentUser.name}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : currentUser.role === 'moderator'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {currentUser.role === 'admin'
                          ? 'Administrador'
                          : currentUser.role === 'moderator'
                          ? 'Moderador'
                          : 'Colaborador'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {/* Account Details & Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/8 text-xs">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-zinc-400 block">Cidade Base</span>
                    <span className="font-semibold text-zinc-200 truncate block">
                      {currentUser.cityDefault || selectedCity.name}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-zinc-400 block">Contribuições</span>
                    <span className="font-semibold text-zinc-200 block">
                      {currentUser.contributionsCount || 0} ({currentUser.approvedCount || 0} aprovadas)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 block">Reputação</span>
                    <span className="font-semibold text-emerald-400 capitalize block">
                      {currentUser.reputationLevel || 'Membro Comunitário'}
                    </span>
                  </div>
                </div>

                {/* Security Card */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-300">
                      Sessão Local Segura
                    </span>
                    <span className="text-[11px] text-emerald-200/80 leading-relaxed block mt-0.5">
                      Seus dados de sessão e preferências estão protegidos localmente neste dispositivo. O Localz não utiliza rastreadores de vigilância comercial nem comercializa cadastros.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: LOCALIZAÇÃO */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'location') && (
            <section id="settings-section-location" className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-[#e50914]" />
                <span>Localização & Região</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                {/* Current Preferred City */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/8">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      Cidade Ativa no Guia
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-black text-sm text-white">
                        {selectedCity.name}, {selectedCity.state}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 font-bold">
                        Selecionada
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCitySelector();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Trocar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* GPS Preference & Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">
                        Uso da Localização do Dispositivo (GPS)
                      </span>
                      <span className="text-[11px] text-zinc-400 block">
                        {userCoords
                          ? `GPS Ativo: Lat ${userCoords.latitude.toFixed(3)}, Lng ${userCoords.longitude.toFixed(3)}`
                          : 'GPS desativado (navegação manual por cidade)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {userCoords && onClearLocation && (
                        <button
                          onClick={() => {
                            onClearLocation();
                            showFeedback('Coordenadas de GPS desativadas.');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                          title="Desativar GPS e usar apenas seleção manual"
                        >
                          Desativar
                        </button>
                      )}

                      <button
                        onClick={onRequestLocation}
                        disabled={locationLoading}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          userCoords
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(229,9,20,0.35)]'
                        }`}
                      >
                        <Navigation
                          className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`}
                        />
                        <span>
                          {locationLoading
                            ? 'Buscando...'
                            : userCoords
                            ? 'Atualizar GPS'
                            : 'Ativar GPS'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Clarification Note: No Forced GPS Requirement */}
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/8 text-[11px] text-zinc-300 leading-relaxed">
                    <span className="font-bold text-white block mb-0.5">
                      ✓ Liberdade de Uso Sem Obrigação de GPS
                    </span>
                    O Localz não obriga você a ativar a localização para navegar. Todas as buscas, comércios, pontos turísticos e plantão de farmácias funcionam plenamente selecionando a cidade desejada.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: NOTIFICAÇÕES */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'notifications') && (
            <section id="settings-section-notifications" className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Bell className="w-4 h-4 text-[#e50914]" />
                <span>Gerenciamento de Notificações</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                {/* Browser Notification Permission Status */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/40 border border-white/8 text-xs">
                  <div>
                    <span className="font-bold text-zinc-200 block">
                      Permissão no Navegador / Dispositivo
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Status:{' '}
                      <span
                        className={`font-bold ${
                          browserNotificationStatus === 'granted'
                            ? 'text-emerald-400'
                            : browserNotificationStatus === 'denied'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {browserNotificationStatus === 'granted'
                          ? 'Concedida'
                          : browserNotificationStatus === 'denied'
                          ? 'Bloqueada'
                          : 'Padrão / Não Solicitada'}
                      </span>
                    </span>
                  </div>

                  {browserNotificationStatus !== 'granted' && (
                    <button
                      onClick={handleRequestBrowserPermission}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-colors cursor-pointer"
                    >
                      Permitir
                    </button>
                  )}
                </div>

                {/* Real Available Notification Toggles */}
                <div className="space-y-2.5 pt-1">
                  {/* Duty Pharmacy Notifications */}
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block">
                        Alertas de Plantão Farmacêutico
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Avisos sobre a farmácia de plantão noturna e em feriados ativa em {selectedCity.name}.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.dutyAlerts}
                        onChange={() => handleToggleNotification('dutyAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                    </label>
                  </div>

                  {/* New Places / Events */}
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block">
                        Novos Estabelecimentos & Eventos
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Informes quando novos comércios ou atrações forem validados pela comunidade.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.newPlaces}
                        onChange={() => handleToggleNotification('newPlaces')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                    </label>
                  </div>

                  {/* Contribution Updates */}
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/40 transition-colors">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block">
                        Moderação de Contribuições & Avaliações
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Atualizações sobre o status de aprovação de locais ou avaliações que você enviou.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={appSettings.notifications.reviewUpdates}
                        onChange={() => handleToggleNotification('reviewUpdates')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: APARÊNCIA */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'appearance') && (
            <section id="settings-section-appearance" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Palette className="w-4 h-4 text-[#e50914]" />
                  <span>Aparência & Tema</span>
                </div>
                {onOpenThemeModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenThemeModal();
                    }}
                    className="text-xs text-[#e50914] hover:text-rose-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Catálogo</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs text-zinc-400">
                  Selecione o esquema visual do Localz. O tema ativo é aplicado instantaneamente a todo o aplicativo:
                </p>

                {/* Themes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => {
                    const isCurrent = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(229,9,20,0.3)] ring-1 ring-red-500/40'
                            : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {theme.name.replace(/^\d+\.\s*/, '')}
                          </span>
                          {isCurrent && (
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="flex items-center gap-1 pt-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: theme.swatches.primary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: theme.swatches.secondary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: theme.swatches.card }}
                          />
                          <span className="text-[10px] text-zinc-400 font-medium ml-1 truncate">
                            {theme.category.split('/')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: PRIVACIDADE & TRANSPARÊNCIA (CONTEÚDO INTEGRAL LGPD) */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'privacy') && (
            <section id="settings-section-privacy" className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Privacidade & Transparência (LGPD)</span>
              </div>

              {/* Exact content originally in PrivacyPolicyModal, fully preserved */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs text-zinc-300 leading-relaxed">
                {/* Transparency Commitment Box */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                  <p className="font-bold text-emerald-300 text-sm">
                    Compromisso de Transparência Localz
                  </p>
                  <p className="mt-1 text-emerald-200/90 leading-relaxed">
                    O Localz foi construído seguindo rigorosamente a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e as diretrizes de privacidade das lojas Google Play e Apple App Store.
                  </p>
                </div>

                {/* 1. Uso da Localização (GPS) */}
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    1. Uso da Localização (GPS)
                  </h4>
                  <p className="text-zinc-300">
                    Sua localização precisa é utilizada <strong>apenas em tempo real</strong> no dispositivo para calcular a distância até comércios, pontos turísticos e a farmácia de plantão mais próxima. <strong>Nunca armazenamos seu histórico de movimentação geográfica</strong> em servidores. O uso de GPS é totalmente opcional: você pode navegar escolhendo qualquer cidade manualmente.
                  </p>
                </div>

                {/* 2. Dados de Contribuições & Avaliações */}
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
                    <Database className="w-4 h-4 text-emerald-400" />
                    2. Dados de Contribuições & Avaliações
                  </h4>
                  <p className="text-zinc-300">
                    Ao sugerir um novo estabelecimento ou publicar uma avaliação, seu nome de exibição e avaliação pública são compartilhados para benefício da comunidade da cidade. Dados confidenciais nunca são repassados a terceiros.
                  </p>
                </div>

                {/* 3. Direito de Exclusão e Revogação */}
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    3. Direito de Exclusão e Revogação
                  </h4>
                  <p className="text-zinc-300">
                    Conforme a LGPD, você tem o direito de solicitar a exclusão de seus dados e limpar o armazenamento local do seu dispositivo a qualquer momento.
                  </p>
                  <button
                    onClick={handleClearAllData}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900/50 transition cursor-pointer"
                  >
                    Limpar Todos os Meus Dados do Navegador
                  </button>
                </div>

                {/* 4. Independência do Localz Score & Publicidade */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/8">
                  <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-[#e50914]" />
                    4. Independência do Localz Score
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Destaques patrocinados e anúncios adquirem visibilidade temporária identificada com badge explícito, mas <strong>nunca compram reputação</strong>: a nota do Localz Score e as avaliações são 100% independentes.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: CONTA E DADOS (EXCLUSÃO & REQUISITOS LOJAS) */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'data') && (
            <section id="settings-section-data" className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Database className="w-4 h-4 text-rose-400" />
                <span>Conta & Exclusão de Dados</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200">
                  <span className="font-bold text-rose-300 block mb-1">
                    Diretrizes das Lojas (Apple App Store & Google Play) & LGPD
                  </span>
                  Esta seção garante o acesso direto e descomplicado à exclusão e portabilidade dos seus dados conforme as políticas de privacidade internacionais e a legislação brasileira.
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/8 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-white block">
                        Limpar Dados Locais & Histórico
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Remove favoritos salvos, preferências, cache e rascunhos deste navegador.
                      </span>
                    </div>

                    <button
                      onClick={handleClearAllData}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Redefinir
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/8 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-white block">
                        Solicitação de Exclusão Integral da Conta
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Canal direto com o Encarregado de Dados (DPO) para eliminação de registros de contribuições públicas.
                      </span>
                    </div>

                    <a
                      href="mailto:dpo@localz.app.br?subject=Solicitacao%20de%20Exclusao%20de%20Conta%20e%20Dados%20-%20Localz"
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <span>Contatar DPO</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* SECTION: SOBRE O LOCALZ */}
          {/* ================================================================= */}
          {(activeSection === 'all' || activeSection === 'about') && (
            <section id="settings-section-about" className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Sobre o Localz</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(229,9,20,0.5)] shrink-0">
                    L
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">
                      Localz — Cidades Brasileiras
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Versão 2.4.0 (Build 2026.09-PROD)
                    </p>
                  </div>
                </div>

                <p className="leading-relaxed text-zinc-300">
                  O <strong>Localz</strong> é uma plataforma comunitária de utilidade pública e valorização do comércio regional. Conectamos cidadãos e visitantes a serviços essenciais — com destaque para a <strong>Farmácia de Plantão 24 Horas em tempo real</strong>, comércios locais, atrações históricas e gastronomia típica de cidades brasileiras.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/8">
                    <span className="text-[10px] text-zinc-400 uppercase block">Licença & Conformidade</span>
                    <span className="font-semibold text-zinc-200 block text-xs mt-0.5">
                      LGPD & Marco Civil
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/8">
                    <span className="text-[10px] text-zinc-400 uppercase block">Origem</span>
                    <span className="font-semibold text-zinc-200 block text-xs mt-0.5">
                      Brasil 🇧🇷
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-400">
            Localz App • Configurações & Privacidade
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
