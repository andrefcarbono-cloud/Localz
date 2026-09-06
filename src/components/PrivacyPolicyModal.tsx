import React from 'react';
import { X, ShieldCheck, MapPin, Database, Trash2, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClearData = () => {
    if (confirm('Deseja limpar todos os dados locais salvos (favoritos, avaliações e cache)? Isso restabelecerá o app para o estado inicial.')) {
      storageService.resetAll();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom duration-200 my-auto">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-neutral-900">Privacidade, LGPD & Termos</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-600 leading-relaxed flex-1">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <p className="font-bold">Compromisso de Transparência Localz</p>
            <p className="mt-0.5">
              O Localz foi construído seguindo rigorosamente a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e as diretrizes de privacidade das lojas Google Play e Apple App Store.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              1. Uso da Localização (GPS)
            </h4>
            <p>
              Sua localização precisa é utilizada <strong>apenas em tempo real</strong> no dispositivo para calcular a distância até comércios, pontos turísticos e a farmácia de plantão mais próxima. <strong>Nunca armazenamos seu histórico de movimentação geográfica</strong> em servidores. O uso de GPS é totalmente opcional: você pode navegar escolhendo qualquer cidade manualmente.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mb-1">
              <Database className="w-4 h-4 text-emerald-600" />
              2. Dados de Contribuições & Avaliações
            </h4>
            <p>
              Ao sugerir um novo estabelecimento ou publicar uma avaliação, seu nome de exibição e avaliação pública são compartilhados para benefício da comunidade da cidade. Dados confidenciais nunca são repassados a terceiros.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mb-1">
              <Trash2 className="w-4 h-4 text-rose-600" />
              3. Direito de Exclusão e Revogação
            </h4>
            <p>
              Conforme a LGPD, você tem o direito de solicitar a exclusão de seus dados e limpar o armazenamento local do seu dispositivo a qualquer momento.
            </p>
            <button
              onClick={handleClearData}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition"
            >
              Limpar Todos os Meus Dados do Navegador
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
