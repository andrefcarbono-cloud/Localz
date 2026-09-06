import React, { useState } from 'react';
import { PharmacyDutyShift, CityConfig, Coordinates, LocalzItem } from '../types';
import { calculateDistanceKm, formatDistance, isShiftActiveNow, getDirectionsUrl } from '../utils/geoUtils';
import {
  ShieldAlert,
  Phone,
  MessageCircle,
  MapPin,
  Navigation,
  Clock,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

interface DutyPharmacySectionProps {
  city: CityConfig;
  shifts: PharmacyDutyShift[];
  userCoords: Coordinates | null;
  onSelectItem: (item: LocalzItem) => void;
  onOpenContributeModal: () => void;
  allPharmacyItems: LocalzItem[];
}

export const DutyPharmacySection: React.FC<DutyPharmacySectionProps> = ({
  city,
  shifts,
  userCoords,
  onSelectItem,
  onOpenContributeModal,
  allPharmacyItems,
}) => {
  // Filter shifts specifically for this city
  const cityShifts = shifts.filter(
    (s) => s.city.toLowerCase() === city.name.toLowerCase()
  );

  // Active shift right now
  const activeShift = cityShifts.find((s) => isShiftActiveNow(s));

  // Upcoming shifts
  const now = new Date().getTime();
  const upcomingShifts = cityShifts.filter((s) => {
    const start = new Date(s.startDateTime).getTime();
    return start > now && s.status === 'confirmed';
  });

  // Find linked item in database if available
  const activeItem = activeShift
    ? allPharmacyItems.find((i) => i.id === activeShift.pharmacyId)
    : null;

  const distanceKm =
    activeShift && userCoords
      ? calculateDistanceKm(userCoords, activeShift.coordinates)
      : null;

  const directions = activeShift
    ? getDirectionsUrl(
        activeShift.coordinates.lat,
        activeShift.coordinates.lng,
        activeShift.pharmacyName
      )
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Municipality Model explanation */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                +
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-neutral-900">
                  Farmácias de Plantão — {city.name}, {city.state}
                </h1>
                <span className="text-xs text-neutral-500">
                  Serviço de Utilidade Pública Localz
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenContributeModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
            Informar Nova Escala
          </button>
        </div>

        {/* Municipality Operating Model Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-700">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">
                Modelo Operacional Municipal:{' '}
                <span className="text-rose-700 font-bold">
                  {city.dutyModel === 'rotation' && 'Rodízio Oficial entre Farmácias'}
                  {city.dutyModel === 'permanent_24h' && 'Farmácia 24h Permanente'}
                  {city.dutyModel === 'multi_24h' && 'Múltiplas Farmácias 24h'}
                  {city.dutyModel === 'scheduled' && 'Escala Definida por Períodos'}
                  {city.dutyModel === 'none_defined' && 'Sem Escala Oficial Cadastrada'}
                </span>
              </p>
              <p className="text-neutral-600 mt-1 leading-relaxed">
                {city.dutyModelDescription}
              </p>
              {city.dutySourceOfficial && (
                <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1 font-mono">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Base legal: {city.dutySourceOfficial}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. SEÇÃO: FARMÁCIA DE PLANTÃO AGORA */}
      {activeShift ? (
        <div className="bg-gradient-to-br from-rose-500/10 via-white to-white rounded-2xl p-5 border-2 border-rose-500 shadow-md">
          {/* Status Badge Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                Farmácia de Plantão Agora
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
              DE PLANTÃO
            </span>
          </div>

          {/* Active Pharmacy Identity */}
          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-neutral-900 leading-tight">
                  {activeShift.pharmacyName}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{activeShift.address}</span>
                </div>
              </div>

              {distanceKm !== null && (
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    {formatDistance(distanceKm)}
                  </span>
                </div>
              )}
            </div>

            {/* Shift Special Schedule */}
            <div className="mt-4 p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{activeShift.specialScheduleText}</p>
                {activeShift.notes && (
                  <p className="text-rose-800 text-[11px] mt-0.5">
                    {activeShift.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Buttons (Call, WhatsApp, GPS Route) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeShift.phone && (
                <a
                  href={`tel:${activeShift.phone.replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  Ligar ({activeShift.phone})
                </a>
              )}

              {activeShift.whatsapp && (
                <a
                  href={`https://wa.me/${activeShift.whatsapp}?text=${encodeURIComponent(
                    'Olá, vi no Localz que vocês estão de plantão hoje.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}

              {directions && (
                <a
                  href={directions.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition"
                >
                  <Navigation className="w-4 h-4" />
                  Rotas GPS (Como Chegar)
                </a>
              )}
            </div>

            {/* Legal Source & Last Confirmation Stamp */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-500 gap-1.5">
              <span className="flex items-center gap-1 font-medium">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Fonte confirmada: {activeShift.source}
              </span>
              <span>
                Última confirmação: {activeShift.lastConfirmedDate.split('-').reverse().join('/')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / No Shift Case with Extreme Integrity */
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">
            Nenhuma escala de plantão confirmada para este horário
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto mt-1.5 leading-relaxed">
            O <strong>Localz</strong> prioriza rigorosamente a confiabilidade e <strong>nunca inventa</strong> farmácias de plantão quando não há escala validada.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Verifique abaixo as farmácias com horário comercial normal ou 24 horas fixas da cidade.
          </p>
          <button
            onClick={onOpenContributeModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Enviar Portaria / Escala da Prefeitura
          </button>
        </div>
      )}

      {/* 2. GLOSSÁRIO DE STATUS (Critério essencial do prompt) */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Entenda as Diferenças de Atendimento no Localz
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-xs font-extrabold text-emerald-800">ABERTO AGORA</span>
            </div>
            <p className="text-[11px] text-emerald-950 mt-1">
              Funcionando no seu horário comercial normal de rotina cadastrado.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span className="text-xs font-extrabold text-rose-800">DE PLANTÃO</span>
            </div>
            <p className="text-[11px] text-rose-950 mt-1">
              Escala oficial extraordinária após o expediente, aos domingos ou feriados.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span className="text-xs font-extrabold text-indigo-800">24 HORAS</span>
            </div>
            <p className="text-[11px] text-indigo-950 mt-1">
              Estabelecimento com atendimento ininterrupto todos os dias.
            </p>
          </div>
        </div>
      </div>

      {/* 3. PRÓXIMAS ESCALAS PROGRAMADAS */}
      {upcomingShifts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <h3 className="font-bold text-neutral-900 text-sm">
              Próximas Escalas de Plantão Publicadas
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {shift.pharmacyName}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{shift.address}</p>
                    <p className="text-xs font-medium text-rose-700 mt-1">
                      {shift.specialScheduleText}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg block">
                      A partir de {shift.startDateTime.split('T')[0].split('-').reverse().join('/')}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      {shift.phone}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TODAS AS FARMÁCIAS CADASTRADAS NO MUNICÍPIO */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
        <h3 className="font-bold text-neutral-900 text-sm mb-3">
          Todas as Drogarias e Farmácias de {city.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allPharmacyItems
            .filter((i) => i.city.toLowerCase() === city.name.toLowerCase())
            .map((pharm) => (
              <div
                key={pharm.id}
                onClick={() => onSelectItem(pharm)}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">{pharm.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{pharm.address}</p>
                  {pharm.phone && (
                    <p className="text-[11px] text-neutral-600 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {pharm.phone}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">Ver Horários</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
