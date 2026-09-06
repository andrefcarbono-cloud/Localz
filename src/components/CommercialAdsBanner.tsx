import React, { useState, useEffect } from 'react';
import { CityConfig, PharmacyDutyShift, CommercialAd } from '../types';
import { INITIAL_COMMERCIAL_ADS } from '../data/adsData';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  MessageCircle,
  PlusCircle,
  X,
  Sparkles,
  CheckCircle2,
  Store,
  PartyPopper
} from 'lucide-react';

interface CommercialAdsBannerProps {
  selectedCity: CityConfig;
  activeDutyShift?: PharmacyDutyShift | null;
  onGoToDuty: () => void;
  onOpenCreateAd?: () => void;
}

export const CommercialAdsBanner: React.FC<CommercialAdsBannerProps> = ({
  selectedCity,
  activeDutyShift,
  onGoToDuty,
  onOpenCreateAd,
}) => {
  const [ads, setAds] = useState<CommercialAd[]>(INITIAL_COMMERCIAL_ADS);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAdForDetail, setSelectedAdForDetail] = useState<CommercialAd | null>(null);
  const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState(false);

  // Form state for creating a new commercial ad
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSubtitle, setNewAdSubtitle] = useState('');
  const [newAdCategory, setNewAdCategory] = useState<'business' | 'event' | 'promo'>('business');
  const [newAdSponsor, setNewAdSponsor] = useState('');
  const [newAdDates, setNewAdDates] = useState('');
  const [newAdAddress, setNewAdAddress] = useState('');
  const [newAdWhatsapp, setNewAdWhatsapp] = useState('');
  const [newAdOffer, setNewAdOffer] = useState('');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdDescription, setNewAdDescription] = useState('');
  const [adSuccessMessage, setAdSuccessMessage] = useState(false);

  // Auto-play slides every 6 seconds unless paused
  useEffect(() => {
    if (isPaused || ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, ads.length]);

  const activeAd = ads[currentSlideIndex] || ads[0];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleAdAction = (ad: CommercialAd) => {
    if (ad.ctaAction === 'advertise') {
      setIsAdvertiseModalOpen(true);
    } else if (ad.ctaAction === 'whatsapp' && ad.whatsappNumber) {
      window.open(`https://wa.me/55${ad.whatsappNumber.replace(/\D/g, '')}?text=Ol%C3%A1,%20vi%20o%20an%C3%BAncio%20no%20Localz!`, '_blank');
    } else {
      setSelectedAdForDetail(ad);
    }
  };

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdSponsor.trim()) return;

    const createdAd: CommercialAd = {
      id: `user-ad-${Date.now()}`,
      type: newAdCategory,
      title: newAdTitle.trim(),
      subtitle: newAdSubtitle.trim() || 'Destaque especial cadastrado no comércio da cidade.',
      badge: newAdCategory === 'event' ? 'Evento em Destaque' : 'Comércio Parceiro',
      sponsorName: newAdSponsor.trim(),
      imageUrl: newAdImageUrl.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      cityId: selectedCity.id,
      ctaText: newAdCategory === 'event' ? 'Ver Programação' : 'Falar no WhatsApp',
      ctaAction: newAdWhatsapp ? 'whatsapp' : 'details',
      whatsappNumber: newAdWhatsapp,
      address: newAdAddress || `${selectedCity.name} - ${selectedCity.state}`,
      dates: newAdDates || 'Promoção válida por tempo limitado',
      highlightOffer: newAdOffer || 'Consulte condições com o anunciante',
      description: newAdDescription || 'Anúncio promocional publicado diretamente pelo comércio local através do Localz.'
    };

    setAds([createdAd, ...ads]);
    setCurrentSlideIndex(0);
    setAdSuccessMessage(true);

    setTimeout(() => {
      setAdSuccessMessage(false);
      setIsAdvertiseModalOpen(false);
      // Reset form
      setNewAdTitle('');
      setNewAdSubtitle('');
      setNewAdSponsor('');
      setNewAdDates('');
      setNewAdAddress('');
      setNewAdWhatsapp('');
      setNewAdOffer('');
      setNewAdImageUrl('');
      setNewAdDescription('');
    }, 1500);
  };

  return (
    <div className="w-full bg-black text-white pt-3 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* SECTION HEADER: ESPAÇO PUBLICITÁRIO & COMERCIAL */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 border border-red-600/30 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Destaques Comerciais & Eventos
                </h2>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  Publicidade
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Promoções, festivais e novidades dos estabelecimentos de {selectedCity.name}
              </p>
            </div>
          </div>

          {/* ANUNCIE AQUI BUTTON */}
          <button
            onClick={() => {
              if (onOpenCreateAd) {
                onOpenCreateAd();
              } else {
                setIsAdvertiseModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition shadow-md shadow-red-900/30 active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Anuncie seu Comércio ou Evento</span>
          </button>
        </div>

        {/* 1. ADVERTISING BILLBOARD CAROUSEL (CAMPO DE PROPAGANDAS) */}
        <div
          className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Ad Image with Dark Vignette */}
          <div className="relative w-full min-h-[260px] sm:min-h-[290px] md:min-h-[320px] flex items-end">
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-all duration-700 transform scale-100 group-hover:scale-102"
            />
            
            {/* Cinematic Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent sm:max-w-2xl" />

            {/* Ad Content */}
            <div className="relative z-10 p-5 sm:p-7 md:p-8 max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                  {activeAd.type === 'event' ? <PartyPopper className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                  {activeAd.badge}
                </span>

                <span className="text-[11px] font-semibold text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  {activeAd.sponsorName}
                </span>

                {activeAd.highlightOffer && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <Tag className="w-3 h-3" />
                    {activeAd.highlightOffer}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                {activeAd.title}
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-zinc-200 mt-2 line-clamp-2 max-w-2xl leading-relaxed">
                {activeAd.subtitle}
              </p>

              {/* Meta: Address / Dates */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-300">
                {activeAd.dates && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {activeAd.dates}
                  </span>
                )}
                {activeAd.address && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {activeAd.address}
                  </span>
                )}
              </div>

              {/* CTA Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleAdAction(activeAd)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white text-xs sm:text-sm font-black transition shadow-lg shadow-red-900/40 cursor-pointer"
                >
                  {activeAd.ctaAction === 'whatsapp' ? (
                    <MessageCircle className="w-4 h-4 fill-white" />
                  ) : activeAd.ctaAction === 'advertise' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  <span>{activeAd.ctaText}</span>
                </button>

                {activeAd.ctaAction !== 'advertise' && (
                  <button
                    onClick={() => setSelectedAdForDetail(activeAd)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs sm:text-sm font-bold transition backdrop-blur-md cursor-pointer"
                  >
                    Ver Mais Detalhes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white border border-white/15 flex items-center justify-center transition opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer shadow-lg"
            aria-label="Anúncio anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white border border-white/15 flex items-center justify-center transition opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer shadow-lg"
            aria-label="Próximo anúncio"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            {ads.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex ? 'w-5 bg-red-600' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                }`}
                title={ad.title}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 2. PUBLIC UTILITY / ESSENTIAL PHARMACY DUTY SHIFT BANNER */}
        <div className="mt-3.5">
          <div
            onClick={onGoToDuty}
            className="group relative rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950/30 border border-zinc-800 hover:border-red-600/50 p-3.5 sm:p-4 shadow-lg transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-900/40 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                    Plantão Hoje
                  </span>
                  <span className="text-xs font-bold text-zinc-400">Utilidade Pública Oficial</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5 group-hover:text-red-400 transition truncate">
                  {activeDutyShift
                    ? `Farmácia de Plantão: ${activeDutyShift.pharmacyName}`
                    : `Escalas de Farmácias em ${selectedCity.name}`}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  Atendimento de emergência e pernoite em tempo real verificado pela comunidade.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <span className="px-3.5 py-1.5 rounded-lg bg-zinc-800 group-hover:bg-red-600 text-white text-xs font-bold transition shadow-xs">
                Ver escala de plantão
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: DETALHES DA PROPAGANDA / EVENTO */}
      {selectedAdForDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedAdForDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="relative aspect-16/9 w-full bg-black">
              <img
                src={selectedAdForDetail.imageUrl}
                alt={selectedAdForDetail.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedAdForDetail(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                {selectedAdForDetail.badge}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-red-400 font-bold">{selectedAdForDetail.sponsorName}</span>
                  <h3 className="text-lg font-black text-white mt-0.5">{selectedAdForDetail.title}</h3>
                </div>
              </div>

              {selectedAdForDetail.highlightOffer && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{selectedAdForDetail.highlightOffer}</span>
                </div>
              )}

              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                {selectedAdForDetail.description || selectedAdForDetail.subtitle}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
                {selectedAdForDetail.dates && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{selectedAdForDetail.dates}</span>
                  </div>
                )}
                {selectedAdForDetail.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{selectedAdForDetail.address}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                {selectedAdForDetail.whatsappNumber && (
                  <a
                    href={`https://wa.me/55${selectedAdForDetail.whatsappNumber.replace(/\D/g, '')}?text=Ol%C3%A1,%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20an%C3%BAncio%20no%20Localz`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contatar no WhatsApp</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedAdForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMULÁRIO DE "ANUNCIE SEU COMÉRCIO OU EVENTO" */}
      {isAdvertiseModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAdvertiseModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Anuncie no Localz</h3>
                  <p className="text-xs text-zinc-400">Divulgue seu comércio, evento ou serviço em {selectedCity.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdvertiseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {adSuccessMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">Anúncio Publicado com Sucesso!</h4>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  Sua propaganda já foi adicionada ao carrossel de destaques de {selectedCity.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAdSubmit} className="p-5 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome do Comércio / Evento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Restaurante Sabor das Minas"
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nome da Empresa Anunciante *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sabor das Minas Ltda"
                      value={newAdSponsor}
                      onChange={(e) => setNewAdSponsor(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Tipo de Anúncio
                    </label>
                    <select
                      value={newAdCategory}
                      onChange={(e) => setNewAdCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-hidden focus:border-red-500"
                    >
                      <option value="business">Comércio / Loja / Gastronomia</option>
                      <option value="event">Evento / Show / Festival</option>
                      <option value="promo">Promoção Especial / Desconto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      WhatsApp para Contato / Reservas
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 35 99999-8888"
                      value={newAdWhatsapp}
                      onChange={(e) => setNewAdWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Slogan ou Chamada Principal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O melhor almoço caseiro com vista para o lago e buffet de sobremesas"
                    value={newAdSubtitle}
                    onChange={(e) => setNewAdSubtitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Oferta em Destaque (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 10% OFF com o app Localz"
                      value={newAdOffer}
                      onChange={(e) => setNewAdOffer(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Horário ou Data do Evento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Todos os dias das 11h às 23h"
                      value={newAdDates}
                      onChange={(e) => setNewAdDates(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Endereço ou Local
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Getúlio Vargas, 150 - Centro"
                      value={newAdAddress}
                      onChange={(e) => setNewAdAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      URL da Foto / Banner (opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/sua-foto.jpg"
                      value={newAdImageUrl}
                      onChange={(e) => setNewAdImageUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Descrição Completa do Anúncio
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conte mais detalhes sobre seu estabelecimento, diferenciais e promoções..."
                    value={newAdDescription}
                    onChange={(e) => setNewAdDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAdvertiseModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition shadow-md shadow-red-900/40 cursor-pointer"
                  >
                    Publicar Propaganda no Carrossel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
