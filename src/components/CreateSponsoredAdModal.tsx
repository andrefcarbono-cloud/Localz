import React, { useState } from 'react';
import {
  SponsoredAd,
  SponsoredAdType,
  SponsoredOfferType,
  UserProfile,
  CityConfig,
  LocalzItem,
} from '../types';
import { storageService } from '../services/storageService';
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Building,
  PartyPopper,
  Info,
} from 'lucide-react';

interface CreateSponsoredAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  selectedCity: CityConfig;
  availableItems: LocalzItem[];
  prefilledItem?: LocalzItem | null;
  onSuccess: () => void;
}

const PRESET_IMAGES = [
  {
    name: 'Hambúrguer Gourmet',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    type: 'dish',
  },
  {
    name: 'Festival / Evento Musical',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    type: 'event',
  },
  {
    name: 'Café & Queijos Coloniais',
    url: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=1000&q=80',
    type: 'dish',
  },
  {
    name: 'Spa & Bem-estar',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    type: 'service',
  },
  {
    name: 'Cervejaria / Chopp Artesanal',
    url: 'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&w=1000&q=80',
    type: 'dish',
  },
  {
    name: 'Pizza & Massas',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    type: 'dish',
  },
];

export const CreateSponsoredAdModal: React.FC<CreateSponsoredAdModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedCity,
  availableItems,
  prefilledItem,
  onSuccess,
}) => {
  const [adType, setAdType] = useState<SponsoredAdType>(
    prefilledItem?.type === 'event' ? 'event' : 'business'
  );
  const [linkedItemId, setLinkedItemId] = useState<string>(
    prefilledItem ? prefilledItem.id : ''
  );
  const [establishmentName, setEstablishmentName] = useState<string>(
    prefilledItem ? prefilledItem.title : ''
  );
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [offerType, setOfferType] = useState<SponsoredOfferType>('dish');
  const [category, setCategory] = useState<string>(
    prefilledItem?.category || 'gastronomia'
  );
  const [priceStr, setPriceStr] = useState<string>('');
  const [originalPriceStr, setOriginalPriceStr] = useState<string>('');
  const [priceNote, setPriceNote] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [validityText, setValidityText] = useState<string>('Oferta válida até o fim do mês');
  const [planDays, setPlanDays] = useState<number>(15);
  const [phone, setPhone] = useState<string>(prefilledItem?.phone || '');
  const [whatsapp, setWhatsapp] = useState<string>(prefilledItem?.whatsapp || '');
  const [address, setAddress] = useState<string>(prefilledItem?.address || '');
  const [neighborhood, setNeighborhood] = useState<string>(prefilledItem?.neighborhood || '');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSelectItem = (id: string) => {
    setLinkedItemId(id);
    const found = availableItems.find((it) => it.id === id);
    if (found) {
      setEstablishmentName(found.title);
      setCategory(found.category);
      setAdType(found.type === 'event' ? 'event' : 'business');
      if (found.address) setAddress(found.address);
      if (found.neighborhood) setNeighborhood(found.neighborhood);
      if (found.phone) setPhone(found.phone);
      if (found.whatsapp) setWhatsapp(found.whatsapp);
      if (found.photos && found.photos.length > 0) setImageUrl(found.photos[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!establishmentName.trim()) {
      setErrorMessage('Informe o nome do estabelecimento ou evento.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Informe um título curto para a promoção ou anúncio.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Informe uma descrição detalhada da oferta.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMessage('Selecione ou informe uma URL de imagem válida.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedPrice = priceStr ? parseFloat(priceStr.replace(',', '.')) : undefined;
      const parsedOriginalPrice = originalPriceStr
        ? parseFloat(originalPriceStr.replace(',', '.'))
        : undefined;

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDateObj = new Date(today);
      endDateObj.setDate(today.getDate() + planDays);
      const endDate = endDateObj.toISOString().split('T')[0];

      const foundItem = linkedItemId ? availableItems.find((i) => i.id === linkedItemId) : null;

      const newAd: SponsoredAd = {
        id: `ad-${Date.now()}`,
        type: adType,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        establishmentOrEventName: establishmentName.trim(),
        targetItemId: linkedItemId || undefined,
        category,
        offerType,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        priceNote: priceNote.trim() || undefined,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        conditions: conditions.trim() || undefined,
        validityText: validityText.trim() || undefined,
        startDate,
        endDate,
        targetCities: [selectedCity.id, 'all'],
        address: address.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        coordinates: foundItem?.coordinates || { lat: -22.1158, lng: -45.0531 },
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        googleMapsUrl: foundItem?.coordinates
          ? `https://maps.google.com/?q=${foundItem.coordinates.lat},${foundItem.coordinates.lng}`
          : undefined,
        moderationStatus: 'pending_approval',
        createdBy: {
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'pending',
        planDurationDays: planDays,
        metrics: {
          impressions: 0,
          clicks: 0,
          contactClicks: 0,
          mapClicks: 0,
        },
      };

      storageService.addSponsoredAd(newAd);
      setIsSubmitting(false);
      setIsSuccessSubmitted(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage('Erro ao cadastrar anúncio: ' + (err.message || 'tente novamente.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                Criar Anúncio Patrocinado
              </h3>
              <p className="text-xs text-zinc-400">
                Ganhe visibilidade no topo e vitrines de {selectedCity.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccessSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-white">
              Anúncio Enviado com Sucesso!
            </h4>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Seu anúncio foi encaminhado para a <strong>fila de moderação obrigatória</strong>.
              Nossa equipe irá revisar as informações, imagens e conformidade antes da ativação pública.
            </p>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-w-sm mx-auto text-xs text-zinc-400 text-left">
              <span className="font-bold text-amber-400 block mb-1">
                Lembrete Localz:
              </span>
              Publicidade e Localz Score são independentes. Anúncios compram destaque e visibilidade, sem alterar sua reputação ou avaliações orgânicas.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Principles & Guarantee Banner */}
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-amber-300 font-bold block mb-0.5">
                  Política de Publicidade Transparente:
                </strong>
                Nenhum anúncio é publicado automaticamente. Todo anúncio passa por aprovação manual prévia. O pagamento compra visibilidade, nunca reputação ou alteração do Localz Score.
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* 1. Tipo de Anúncio */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                1. Tipo de Divulgação
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdType('business')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    adType === 'business'
                      ? 'bg-amber-400/15 border-amber-400 text-white font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Comércio ou Serviço</span>
                    <span className="text-[10px] text-zinc-400">Restaurantes, lojas, clínicas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdType('event')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    adType === 'event'
                      ? 'bg-amber-400/15 border-amber-400 text-white font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <PartyPopper className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold block">Evento ou Atração</span>
                    <span className="text-[10px] text-zinc-400">Festivais, feiras, shows</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Vincular a Estabelecimento Existente ou Informar Nome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Vincular a Local Existente
                </label>
                <select
                  value={linkedItemId}
                  onChange={(e) => handleSelectItem(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- Selecionar ou digitar abaixo --</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.subcategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nome do Estabelecimento / Organizador *
                </label>
                <input
                  type="text"
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  placeholder="Ex: Hamburgueria São Lourenço"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Título & Subtítulo */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Título Curto da Oferta ou Atração *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Combo Bacon + Fritas Artesanais"
                  required
                  maxLength={65}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Recomendado: seja direto e objetivo (até 65 caracteres).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Slogan ou Subtítulo (Opcional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Acompanha molho da casa e bebida à sua escolha"
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Categoria e Formato da Oferta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tipo de Oferta
                </label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value as SponsoredOfferType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="dish">Prato / Gastronomia</option>
                  <option value="offer">Oferta Promocional</option>
                  <option value="product">Produto Físico</option>
                  <option value="service">Serviço Especializado</option>
                  <option value="experience">Experiência Local</option>
                  <option value="event">Evento Cultural / Show</option>
                  <option value="ticket">Ingresso / Atração</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="gastronomia">Gastronomia & Bares</option>
                  <option value="comercio">Comércio Varejista</option>
                  <option value="servicos">Serviços</option>
                  <option value="eventos">Eventos & Cultura</option>
                  <option value="hospedagem">Hospedagem & Pousadas</option>
                  <option value="turismo">Turismo & Passeios</option>
                </select>
              </div>
            </div>

            {/* 5. Preços e Validade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Preço Promocional (R$)
                </label>
                <input
                  type="text"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder="Ex: 29,90"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Preço Original (Riscado)
                </label>
                <input
                  type="text"
                  value={originalPriceStr}
                  onChange={(e) => setOriginalPriceStr(e.target.value)}
                  placeholder="Ex: 39,90"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Texto de Validade
                </label>
                <input
                  type="text"
                  value={validityText}
                  onChange={(e) => setValidityText(e.target.value)}
                  placeholder="Ex: Válido até hoje, 22h"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 6. Imagem Principal */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Imagem Principal do Anúncio *
              </label>

              {/* Presets Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition ${
                      imageUrl === preset.url
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-[9px] text-center font-bold">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ou cole a URL da sua foto (https://...)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* 7. Descrição e Condições */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Descrição Completa da Oferta *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descreva detalhadamente o produto, ingredientes, o que está incluso e diferenciais..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Condições e Regras (Opcional)
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Ex: Válido para consumo no local de seg a qui. 1 cupom por pessoa."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 8. Contato e Duração */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  WhatsApp para Contato
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="35999887766"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Telefone Fixo
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(35) 3332-1234"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Duração do Destaque
                </label>
                <select
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value={7}>7 dias de veiculação</option>
                  <option value={15}>15 dias de veiculação</option>
                  <option value={30}>30 dias de veiculação</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950 transition active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Cadastrando...' : 'Enviar para Moderação'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
