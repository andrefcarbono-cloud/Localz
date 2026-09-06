import React, { useState } from 'react';
import { CityConfig, ItemType, MainCategory, UserProfile, CollaborativeContribution } from '../types';
import { storageService } from '../services/storageService';
import {
  X,
  PlusCircle,
  Building2,
  Calendar,
  Landmark,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  FileText,
} from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityConfig;
  currentUser: UserProfile;
  onContributionSubmitted: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  city,
  currentUser,
  onContributionSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'place' | 'event' | 'duty'>('business');
  const [success, setSuccess] = useState(false);

  // Common fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MainCategory>('gastronomia');
  const [subcategory, setSubcategory] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');

  // Event specific fields
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [ticketPrice, setTicketPrice] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly' | 'annual'>('none');

  // Duty shift specific fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [specialScheduleText, setSpecialScheduleText] = useState('Das 18h às 22h / Plantão de Domingo');
  const [sourceText, setSourceText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any = {};
    let contribType: CollaborativeContribution['type'] = 'new_item';
    let targetItemType: ItemType = 'business';

    if (activeTab === 'duty') {
      contribType = 'new_duty_shift';
      payload = {
        pharmacyName,
        address,
        phone,
        startDateTime: shiftStart || new Date().toISOString(),
        endDateTime: shiftEnd || new Date(Date.now() + 7 * 86400000).toISOString(),
        specialScheduleText,
        source: sourceText || 'Colaboração cidadã via app Localz',
      };
    } else if (activeTab === 'event') {
      targetItemType = 'event';
      payload = {
        title,
        description,
        category: 'eventos_cultura',
        subcategory: subcategory || 'Eventos e Shows',
        address,
        neighborhood,
        phone,
        startDate: eventDate || new Date().toISOString().split('T')[0],
        startTime: eventTime || '19:00',
        organizerName: organizerName || currentUser.name,
        isFree,
        ticketPrice: isFree ? undefined : ticketPrice,
        recurrence,
        coordinates: city.coordinates,
      };
    } else {
      targetItemType = activeTab === 'place' ? 'place' : 'business';
      payload = {
        title,
        description,
        category,
        subcategory: subcategory || (activeTab === 'place' ? 'Ponto Turístico' : 'Comércio Geral'),
        address,
        neighborhood,
        phone,
        whatsapp,
        coordinates: city.coordinates,
      };
    }

    const newContrib: CollaborativeContribution = {
      id: `contrib-${Date.now()}`,
      type: contribType,
      itemType: targetItemType,
      targetItemTitle: activeTab === 'duty' ? `Plantão: ${pharmacyName}` : title,
      city: city.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      payload,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    storageService.addContribution(newContrib);
    setSuccess(true);
    onContributionSubmitted();

    setTimeout(() => {
      setSuccess(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setAddress('');
      setPhone('');
      setWhatsapp('');
      setPharmacyName('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Cadastro Colaborativo</h2>
              <p className="text-xs text-neutral-500">
                Adicionar informações para {city.name}, {city.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-2 bg-neutral-100/80 gap-1 border-b border-neutral-200/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'business'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Comércio / Serviço
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('place')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'place'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-teal-600" />
            Lugar / Turismo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'event'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Evento
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('duty')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'duty'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Plantão Farmácia
          </button>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="p-10 text-center flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Sugestão Enviada com Sucesso!</h3>
            <p className="text-xs text-neutral-600 max-w-sm mt-1">
              Sua contribuição foi enviada para a fila de moderação do Localz. Assim que for aprovada pelo moderador, aparecerá para todos os moradores da cidade.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Colaborando como <strong>{currentUser.name}</strong> ({currentUser.email}). As informações passam por moderação antes de serem publicadas.
              </span>
            </div>

            {/* TAB: DUTY PHARMACY */}
            {activeTab === 'duty' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Nome da Farmácia *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Drogaria Popular Central"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Endereço Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rua, número e centro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Telefone da Farmácia
                    </label>
                    <input
                      type="text"
                      placeholder="(XX) 3333-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Data Início do Plantão
                    </label>
                    <input
                      type="datetime-local"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Data Término do Plantão
                    </label>
                    <input
                      type="datetime-local"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Horário Especial / Instrução *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Das 18h às 22h direto / plantão de emergência após às 22h"
                    value={specialScheduleText}
                    onChange={(e) => setSpecialScheduleText(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Fonte da Informação (Crucial para validação) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Decreto da Prefeitura, cartaz afixado na porta, CDL"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>
              </>
            ) : (
              /* TAB: BUSINESS / PLACE / EVENT */
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Título / Nome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do local, comércio ou evento"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Categoria Principal
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MainCategory)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="gastronomia">Gastronomia (Restaurantes, Cafés, Bares)</option>
                      <option value="servicos">Serviços e Profissionais</option>
                      <option value="compras">Comércio e Lojas</option>
                      <option value="turismo_lazer">Turismo, Praças e Lazer</option>
                      <option value="saude_farmacia">Saúde e Farmácia</option>
                      <option value="eventos_cultura">Eventos e Cultura</option>
                      <option value="automotivo">Automotivo e Oficinas</option>
                      <option value="hospedagem">Pousadas e Hotéis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Subcategoria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pizzaria, Mecânica, Ponto Turístico"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Endereço Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Rua, número e bairro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Centro, Federal"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      placeholder="(XX) 3333-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="55XXXXXXXXXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Event specific */}
                {activeTab === 'event' && (
                  <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Data do Evento *
                        </label>
                        <input
                          type="date"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Horário de Início
                        </label>
                        <input
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFree}
                          onChange={(e) => setIsFree(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        Entrada Gratuita
                      </label>

                      {!isFree && (
                        <input
                          type="text"
                          placeholder="Valor do ingresso (ex: R$ 25,00)"
                          value={ticketPrice}
                          onChange={(e) => setTicketPrice(e.target.value)}
                          className="flex-1 px-3 py-1 text-xs bg-white border border-neutral-200 rounded-lg"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Organizador
                        </label>
                        <input
                          type="text"
                          placeholder="Nome do organizador ou instituição"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Recorrência
                        </label>
                        <select
                          value={recurrence}
                          onChange={(e) => setRecurrence(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg"
                        >
                          <option value="none">Único</option>
                          <option value="weekly">Semanal (Todo fim de semana)</option>
                          <option value="monthly">Mensal</option>
                          <option value="annual">Anual / Festa Tradicional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Descrição Detalhada *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Conte sobre os produtos, serviços, diferencial ou horários..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-xs transition ${
                  activeTab === 'duty'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Enviar para Aprovação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
