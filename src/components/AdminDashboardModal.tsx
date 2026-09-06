import React, { useState } from 'react';
import {
  CollaborativeContribution,
  PharmacyDutyShift,
  CityConfig,
  UserProfile,
  LocalzItem,
  SponsoredAd,
  ModerationStatus,
  PaymentStatus,
} from '../types';
import { storageService, DEFAULT_USERS } from '../services/storageService';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Plus,
  FileCheck2,
  Building,
  Calendar,
  AlertTriangle,
  History,
  X,
  Lock,
  Sparkles,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Eye,
  DollarSign,
  Tag,
  Info,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  selectedCity: CityConfig;
  contributions: CollaborativeContribution[];
  dutyShifts: PharmacyDutyShift[];
  onRefreshData: () => void;
  pharmacyItems: LocalzItem[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangeUser,
  selectedCity,
  contributions,
  dutyShifts,
  onRefreshData,
  pharmacyItems,
}) => {
  const [activeTab, setActiveTab] = useState<'contributions' | 'shifts' | 'ads' | 'users'>('contributions');

  // Sponsored Ads moderation state
  const [adFilter, setAdFilter] = useState<'all' | 'pending' | 'active' | 'paused' | 'rejected'>('pending');
  const [rejectionModalAd, setRejectionModalAd] = useState<SponsoredAd | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [previewAd, setPreviewAd] = useState<SponsoredAd | null>(null);
  const [adsList, setAdsList] = useState<SponsoredAd[]>(storageService.getSponsoredAds());

  const refreshAds = () => {
    setAdsList(storageService.getSponsoredAds());
    onRefreshData();
  };

  // New shift creation state
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShiftPharmacyId, setNewShiftPharmacyId] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');
  const [newShiftScheduleText, setNewShiftScheduleText] = useState('Plantão das 18h às 22h');
  const [newShiftSource, setNewShiftSource] = useState('Prefeitura Municipal - Portaria nº ');
  const [newShiftNotes, setNewShiftNotes] = useState('');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'moderator';

  const pendingContributions = contributions.filter((c) => c.status === 'pending');
  const reviewedContributions = contributions.filter((c) => c.status !== 'pending');

  const handleApprove = (contribId: string) => {
    if (!isAdmin) {
      alert('Apenas Administradores e Moderadores podem aprovar contribuições.');
      return;
    }
    storageService.reviewContribution(contribId, 'approved', currentUser.name);
    onRefreshData();
  };

  const handleReject = (contribId: string) => {
    if (!isAdmin) {
      alert('Apenas Administradores e Moderadores podem rejeitar contribuições.');
      return;
    }
    const reason = prompt('Motivo da rejeição (opcional):') || 'Informação incompleta ou não confirmada';
    storageService.reviewContribution(contribId, 'rejected', currentUser.name, reason);
    onRefreshData();
  };

  // --- SPONSORED ADS HANDLERS ---
  const handleApproveAd = (adId: string) => {
    if (!isAdmin) {
      alert('Apenas Administradores e Moderadores podem aprovar anúncios.');
      return;
    }
    storageService.reviewSponsoredAd(adId, 'approved', currentUser.name);
    refreshAds();
  };

  const handleOpenRejectModal = (ad: SponsoredAd) => {
    if (!isAdmin) {
      alert('Apenas Administradores e Moderadores podem rejeitar anúncios.');
      return;
    }
    setRejectionModalAd(ad);
    setRejectionReasonInput('Não está em conformidade com as diretrizes editoriais do Localz.');
  };

  const handleConfirmRejectAd = () => {
    if (!rejectionModalAd) return;
    storageService.reviewSponsoredAd(
      rejectionModalAd.id,
      'rejected',
      currentUser.name,
      rejectionReasonInput.trim() || 'Não cumpre as diretrizes do Localz.'
    );
    setRejectionModalAd(null);
    setRejectionReasonInput('');
    refreshAds();
  };

  const handleTogglePauseAd = (adId: string) => {
    if (!isAdmin) {
      alert('Apenas Administradores e Moderadores podem pausar/retomar anúncios.');
      return;
    }
    storageService.togglePauseSponsoredAd(adId, currentUser.name);
    refreshAds();
  };

  const handleUpdatePayment = (adId: string, status: PaymentStatus) => {
    if (!isAdmin) {
      alert('Apenas Administradores podem atualizar o status de pagamento.');
      return;
    }
    storageService.updateSponsoredAdPayment(adId, status, currentUser.name);
    refreshAds();
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Apenas Administradores podem cadastrar escalas de plantão.');
      return;
    }

    const selectedPharm = pharmacyItems.find((p) => p.id === newShiftPharmacyId);
    if (!selectedPharm) {
      alert('Selecione uma farmácia cadastrada');
      return;
    }

    const newShift: PharmacyDutyShift = {
      id: `shift-admin-${Date.now()}`,
      city: selectedCity.name,
      state: selectedCity.state,
      pharmacyId: selectedPharm.id,
      pharmacyName: selectedPharm.title,
      address: selectedPharm.address,
      phone: selectedPharm.phone || '(35) 3332-0000',
      whatsapp: selectedPharm.whatsapp,
      coordinates: selectedPharm.coordinates,
      startDateTime: newShiftStart || new Date().toISOString(),
      endDateTime: newShiftEnd || new Date(Date.now() + 7 * 86400000).toISOString(),
      specialScheduleText: newShiftScheduleText,
      source: newShiftSource,
      sourceType: 'official_decree',
      status: 'confirmed',
      lastConfirmedDate: new Date().toISOString().split('T')[0],
      notes: newShiftNotes,
      confirmedByAdminId: currentUser.id,
    };

    storageService.addDutyShift(newShift);
    setIsAddingShift(false);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom duration-200 my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Painel de Moderação & Gestão Local</h2>
              <p className="text-xs text-neutral-400">
                Administração municipal de {selectedCity.name}, {selectedCity.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Switcher banner for testability */}
        <div className="px-5 py-3 bg-neutral-100 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Sessão Atual:</span>
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : currentUser.role === 'moderator'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Alternar perfil:</span>
            {DEFAULT_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => onChangeUser(u)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  currentUser.id === u.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                }`}
              >
                {u.name.split(' ')[0]} ({u.role})
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 px-5 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('contributions')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'contributions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Fila de Moderação ({pendingContributions.length})
          </button>

          <button
            onClick={() => setActiveTab('shifts')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'shifts'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Gestão de Plantões ({dutyShifts.length})
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ads'
                ? 'border-amber-500 text-amber-700 font-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Publicidade & Anúncios
            {adsList.filter((a) => a.moderationStatus === 'pending_approval').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {adsList.filter((a) => a.moderationStatus === 'pending_approval').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Histórico & Auditoria
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 flex-1 space-y-4">
          {!isAdmin && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Modo Somente Leitura</p>
                <p className="mt-0.5">
                  Seu perfil atual é <strong>Usuário Comum</strong>. Apenas administradores e moderadores podem aprovar contribuições ou cadastrar escalas. Utilize o botão acima para alternar para Ana Paula (Admin).
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: CONTRIBUTIONS QUEUE */}
          {activeTab === 'contributions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">
                  Contribuições Pendentes ({pendingContributions.length})
                </h3>
              </div>

              {pendingContributions.length === 0 ? (
                <div className="py-12 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-800">Tudo em dia!</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Nenhuma sugestão pendente aguardando aprovação no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingContributions.map((contrib) => (
                    <div
                      key={contrib.id}
                      className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-white transition shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800">
                              {contrib.type === 'new_item' && 'Novo Local / Comércio'}
                              {contrib.type === 'new_duty_shift' && 'Escala de Plantão'}
                              {contrib.type === 'edit_item' && 'Alteração de Dados'}
                            </span>
                            <span className="text-xs text-neutral-500">
                              Cidade: <strong>{contrib.city}</strong>
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-neutral-900 mt-1.5">
                            {contrib.targetItemTitle}
                          </h4>

                          <p className="text-xs text-neutral-600 mt-1">
                            {contrib.payload.description || contrib.payload.specialScheduleText || 'Sem descrição'}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-neutral-500">
                            <span>Autor: <strong>{contrib.userName}</strong> ({contrib.userEmail})</span>
                            <span>Enviado em: {contrib.submittedAt.split('T')[0].split('-').reverse().join('/')}</span>
                            {contrib.payload.source && (
                              <span className="text-emerald-700 font-medium">
                                Fonte: {contrib.payload.source}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleReject(contrib.id)}
                            disabled={!isAdmin}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50"
                          >
                            Rejeitar
                          </button>
                          <button
                            onClick={() => handleApprove(contrib.id)}
                            disabled={!isAdmin}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                          >
                            Aprovar e Publicar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PHARMACY DUTY MANAGER */}
          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Escalas de Plantão Cadastradas — {selectedCity.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Publicações oficiais com validade jurídica e controle sanitário
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddingShift(!isAddingShift)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Escala Oficial
                  </button>
                )}
              </div>

              {/* Add Shift Form */}
              {isAddingShift && (
                <form
                  onSubmit={handleCreateShift}
                  className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase text-rose-900">
                    Cadastrar Nova Escala Municipal de Plantão
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Farmácia Credenciada *
                    </label>
                    <select
                      required
                      value={newShiftPharmacyId}
                      onChange={(e) => setNewShiftPharmacyId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                    >
                      <option value="">Selecione a Farmácia...</option>
                      {pharmacyItems
                        .filter((p) => p.city.toLowerCase() === selectedCity.name.toLowerCase())
                        .map((pharm) => (
                          <option key={pharm.id} value={pharm.id}>
                            {pharm.title} — {pharm.address}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Data/Hora Início
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newShiftStart}
                        onChange={(e) => setNewShiftStart(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Data/Hora Término
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newShiftEnd}
                        onChange={(e) => setNewShiftEnd(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Regra / Horário Especial *
                    </label>
                    <input
                      type="text"
                      required
                      value={newShiftScheduleText}
                      onChange={(e) => setNewShiftScheduleText(e.target.value)}
                      placeholder="Ex: Plantão das 18h às 22h direto / pernoite de emergência"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Fonte Oficial (Decreto, Portaria, CDL) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newShiftSource}
                      onChange={(e) => setNewShiftSource(e.target.value)}
                      placeholder="Ex: Secretaria de Saúde - Portaria nº 148/2026"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Observações Farmacêuticas / Plantonista
                    </label>
                    <input
                      type="text"
                      value={newShiftNotes}
                      onChange={(e) => setNewShiftNotes(e.target.value)}
                      placeholder="Ex: Farmacêutico responsável presente durante todo o período"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingShift(false)}
                      className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                    >
                      Salvar e Publicar
                    </button>
                  </div>
                </form>
              )}

              {/* Shifts List */}
              <div className="divide-y divide-neutral-100">
                {dutyShifts
                  .filter((s) => s.city.toLowerCase() === selectedCity.name.toLowerCase())
                  .map((shift) => (
                    <div key={shift.id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{shift.pharmacyName}</h4>
                        <p className="text-[11px] text-neutral-500">{shift.address} • {shift.phone}</p>
                        <p className="text-xs text-rose-700 font-semibold mt-0.5">
                          {shift.specialScheduleText}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Fonte: {shift.source} (Confirmado em {shift.lastConfirmedDate})
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        {shift.status === 'confirmed' ? 'Confirmado' : 'Em Análise'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: PUBLICIDADE & ANÚNCIOS PATROCINADOS */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              {/* Constitutional Notice */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold text-amber-950 block mb-0.5">
                    Regra Constitutiva do Localz:
                  </strong>
                  Pagamento compra exclusivamente visibilidade, nunca reputação. Nenhum anúncio pode ser publicado automaticamente. A publicidade é 100% segregada e não altera resenhas, posição orgânica nem o Localz Score.
                </div>
              </div>

              {/* Sub-Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setAdFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      adFilter === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <span>Aguardando Aprovação</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">
                      {adsList.filter((a) => a.moderationStatus === 'pending_approval').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setAdFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      adFilter === 'all'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todos ({adsList.length})
                  </button>

                  <button
                    onClick={() => setAdFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      adFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Ativos ({adsList.filter((a) => a.moderationStatus === 'active').length})
                  </button>

                  <button
                    onClick={() => setAdFilter('paused')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      adFilter === 'paused'
                        ? 'bg-neutral-800 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Pausados ({adsList.filter((a) => a.moderationStatus === 'paused').length})
                  </button>

                  <button
                    onClick={() => setAdFilter('rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      adFilter === 'rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Rejeitados ({adsList.filter((a) => a.moderationStatus === 'rejected').length})
                  </button>
                </div>

                <span className="text-xs text-neutral-400 font-medium">
                  {adsList.filter((a) => {
                    if (adFilter === 'pending') return a.moderationStatus === 'pending_approval';
                    if (adFilter === 'active') return a.moderationStatus === 'active';
                    if (adFilter === 'paused') return a.moderationStatus === 'paused';
                    if (adFilter === 'rejected') return a.moderationStatus === 'rejected';
                    return true;
                  }).length}{' '}
                  anúncios encontrados
                </span>
              </div>

              {/* Ads List */}
              <div className="space-y-3 pt-2">
                {adsList
                  .filter((a) => {
                    if (adFilter === 'pending') return a.moderationStatus === 'pending_approval';
                    if (adFilter === 'active') return a.moderationStatus === 'active';
                    if (adFilter === 'paused') return a.moderationStatus === 'paused';
                    if (adFilter === 'rejected') return a.moderationStatus === 'rejected';
                    return true;
                  })
                  .map((ad) => (
                    <div
                      key={ad.id}
                      className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Thumbnail & Basic Info */}
                        <div className="flex items-start gap-3.5">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                {ad.establishmentOrEventName}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-neutral-100 text-neutral-700">
                                {ad.offerType}
                              </span>
                              {ad.price !== undefined && (
                                <span className="text-xs font-black text-neutral-900">
                                  {ad.price === 0 ? 'Gratuito' : `R$ ${ad.price.toFixed(2).replace('.', ',')}`}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                              {ad.title}
                            </h4>

                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {ad.subtitle || ad.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 mt-1.5">
                              <span>Período: {ad.startDate} até {ad.endDate}</span>
                              <span>•</span>
                              <span>Criado por: {ad.createdBy.userName}</span>
                              {ad.validityText && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-700 font-medium">{ad.validityText}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badges & Quick Actions */}
                        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="flex items-center gap-2">
                            {/* Moderation Badge */}
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                ad.moderationStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ad.moderationStatus === 'pending_approval'
                                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                                  : ad.moderationStatus === 'paused'
                                  ? 'bg-neutral-200 text-neutral-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {ad.moderationStatus === 'pending_approval'
                                ? 'Aguardando Aprovação'
                                : ad.moderationStatus === 'active'
                                ? 'Ativo & Veiculando'
                                : ad.moderationStatus === 'paused'
                                ? 'Pausado'
                                : ad.moderationStatus === 'rejected'
                                ? 'Rejeitado'
                                : ad.moderationStatus}
                            </span>

                            {/* Payment Badge */}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                ad.paymentStatus === 'paid'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : ad.paymentStatus === 'complimentary'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                              }`}
                            >
                              Pagamento: {ad.paymentStatus === 'paid' ? 'Quitado' : ad.paymentStatus === 'complimentary' ? 'Cortesia' : 'Pendente'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {/* Preview Button */}
                            <button
                              onClick={() => setPreviewAd(ad)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview
                            </button>

                            {/* Moderation Decision */}
                            {ad.moderationStatus === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveAd(ad.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Aprovar
                                </button>

                                <button
                                  onClick={() => handleOpenRejectModal(ad)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Rejeitar
                                </button>
                              </>
                            )}

                            {/* Pause / Resume */}
                            {(ad.moderationStatus === 'active' || ad.moderationStatus === 'paused') && (
                              <button
                                onClick={() => handleTogglePauseAd(ad.id)}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                                  ad.moderationStatus === 'active'
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                                }`}
                              >
                                {ad.moderationStatus === 'active' ? (
                                  <>
                                    <PauseCircle className="w-3.5 h-3.5" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    Retomar
                                  </>
                                )}
                              </button>
                            )}

                            {/* Payment status dropdown */}
                            <select
                              value={ad.paymentStatus}
                              onChange={(e) => handleUpdatePayment(ad.id, e.target.value as PaymentStatus)}
                              className="text-[11px] font-semibold px-2 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 focus:outline-none focus:border-amber-400"
                            >
                              <option value="paid">Financeiro: Pago</option>
                              <option value="pending">Financeiro: Pendente</option>
                              <option value="complimentary">Financeiro: Cortesia</option>
                              <option value="refunded">Financeiro: Reembolsado</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason Box (if rejected) */}
                      {ad.moderationStatus === 'rejected' && ad.rejectionReason && (
                        <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                          <strong>Motivo da Rejeição:</strong> {ad.rejectionReason}
                          {ad.reviewedBy && (
                            <span className="block text-[10px] text-rose-600 mt-0.5">
                              Revisado por {ad.reviewedBy} em {ad.reviewedAt?.split('T')[0]}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Audit History Log */}
                      {ad.moderationHistory && ad.moderationHistory.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-100">
                          <details className="text-[11px] text-neutral-500">
                            <summary className="cursor-pointer font-bold text-neutral-600 hover:text-neutral-900">
                              Histórico de Auditoria ({ad.moderationHistory.length} registros)
                            </summary>
                            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-neutral-200">
                              {ad.moderationHistory.map((h, i) => (
                                <div key={i} className="text-[10px]">
                                  <span className="font-bold text-neutral-700">{h.action}</span> por{' '}
                                  <span className="font-semibold text-neutral-800">{h.performedBy}</span> em{' '}
                                  {h.date.split('T')[0]}
                                  {h.note && <span className="text-neutral-500 block">"{h.note}"</span>}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}

                {adsList.filter((a) => {
                  if (adFilter === 'pending') return a.moderationStatus === 'pending_approval';
                  if (adFilter === 'active') return a.moderationStatus === 'active';
                  if (adFilter === 'paused') return a.moderationStatus === 'paused';
                  if (adFilter === 'rejected') return a.moderationStatus === 'rejected';
                  return true;
                }).length === 0 && (
                  <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <p className="text-xs text-neutral-500">
                      Nenhum anúncio nesta categoria no momento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-900">Histórico de Moderações & Alterações</h3>
              <div className="divide-y divide-neutral-100 text-xs">
                {reviewedContributions.map((rev) => (
                  <div key={rev.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-900">{rev.targetItemTitle}</span>
                      <p className="text-[11px] text-neutral-500">
                        Revisado por {rev.reviewedBy} em {rev.reviewedAt?.split('T')[0].split('-').reverse().join('/')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rev.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL DE REJEIÇÃO COM JUSTIFICATIVA OBRIGATÓRIA */}
        {rejectionModalAd && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <XCircle className="w-5 h-5" />
                  Rejeitar Anúncio Patrocinado
                </div>
                <button
                  onClick={() => setRejectionModalAd(null)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-neutral-600 mb-2">
                  Você está rejeitando o anúncio <strong>"{rejectionModalAd.title}"</strong> de{' '}
                  <strong>{rejectionModalAd.establishmentOrEventName}</strong>.
                </p>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Motivo da Rejeição (Visível para o anunciante):
                </label>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  rows={3}
                  placeholder="Explique o motivo (ex: violação de diretrizes, imagens de baixa qualidade, dados enganosos)..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => setRejectionModalAd(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRejectAd}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE PREVIEW DO ANÚNCIO */}
        {previewAd && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-in fade-in">
              <div className="relative h-48 bg-zinc-900">
                <img
                  src={previewAd.imageUrl}
                  alt={previewAd.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPreviewAd(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3 bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Patrocinado
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div>
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    {previewAd.establishmentOrEventName}
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {previewAd.title}
                  </h3>
                  {previewAd.subtitle && (
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">
                      {previewAd.subtitle}
                    </p>
                  )}
                </div>

                {previewAd.price !== undefined && (
                  <div className="flex items-baseline gap-2 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xl font-black text-amber-400">
                      {previewAd.price === 0 ? 'Gratuito' : `R$ ${previewAd.price.toFixed(2).replace('.', ',')}`}
                    </span>
                    {previewAd.originalPrice && (
                      <span className="line-through text-zinc-500">
                        R$ {previewAd.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    {previewAd.priceNote && (
                      <span className="text-zinc-400">({previewAd.priceNote})</span>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                    {previewAd.description}
                  </p>
                  {previewAd.conditions && (
                    <p className="text-amber-300 font-medium">
                      Regras: {previewAd.conditions}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Cidade: {previewAd.targetCities.join(', ')}</span>
                  <button
                    onClick={() => setPreviewAd(null)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700"
                  >
                    Fechar Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
