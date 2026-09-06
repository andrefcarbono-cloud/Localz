import React, { useState } from 'react';
import { LocalzItem, Review, ReviewDimension, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  item: LocalzItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  item,
  isOpen,
  onClose,
  currentUser,
  onReviewSubmitted,
}) => {
  if (!isOpen || !item) return null;

  // Determine dimensional criteria based on item category or type
  const getInitialDimensions = (): ReviewDimension[] => {
    if (item.category === 'gastronomia') {
      return [
        { key: 'comida', label: 'Qualidade da Comida / Sabor', rating: 5 },
        { key: 'atendimento', label: 'Atendimento e Hospitalidade', rating: 5 },
        { key: 'preco', label: 'Preço Justo', rating: 4 },
        { key: 'ambiente', label: 'Ambiente e Decoração', rating: 5 },
        { key: 'limpeza', label: 'Higiene e Limpeza', rating: 5 },
        { key: 'custo_beneficio', label: 'Custo-Benefício Global', rating: 5 },
      ];
    }
    if (item.category === 'automotivo' || item.type === 'service') {
      return [
        { key: 'qualidade', label: 'Qualidade Técnica do Serviço', rating: 5 },
        { key: 'atendimento', label: 'Atendimento', rating: 5 },
        { key: 'confianca', label: 'Confiança / Honestidade', rating: 5 },
        { key: 'prazo', label: 'Cumprimento de Prazo', rating: 4 },
        { key: 'preco', label: 'Preço', rating: 4 },
      ];
    }
    if (item.type === 'event') {
      return [
        { key: 'organizacao', label: 'Organização Geral', rating: 5 },
        { key: 'estrutura', label: 'Estrutura e Acessibilidade', rating: 5 },
        { key: 'seguranca', label: 'Segurança e Conforto', rating: 5 },
        { key: 'atracoes', label: 'Qualidade das Atrações', rating: 5 },
        { key: 'experiencia', label: 'Experiência Global', rating: 5 },
      ];
    }
    if (item.category === 'saude_farmacia') {
      return [
        { key: 'atendimento', label: 'Atendimento e Cordialidade', rating: 5 },
        { key: 'agilidade', label: 'Agilidade / Tempo de Espera', rating: 5 },
        { key: 'disponibilidade', label: 'Disponibilidade de Medicamentos', rating: 5 },
        { key: 'preco', label: 'Preços e Descontos', rating: 4 },
      ];
    }
    // Default place/business
    return [
      { key: 'experiencia', label: 'Experiência Geral', rating: 5 },
      { key: 'atendimento', label: 'Atendimento / Recepção', rating: 5 },
      { key: 'infraestrutura', label: 'Conservação e Limpeza', rating: 5 },
      { key: 'custo_beneficio', label: 'Custo-Benefício', rating: 5 },
    ];
  };

  const [dimensions, setDimensions] = useState<ReviewDimension[]>(getInitialDimensions());
  const [overallRating, setOverallRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [verifiedVisit, setVerifiedVisit] = useState(true);

  const handleDimensionChange = (index: number, newRating: number) => {
    const updated = [...dimensions];
    updated[index].rating = newRating;
    setDimensions(updated);

    // Update overall rating as average
    const avg = updated.reduce((sum, d) => sum + d.rating, 0) / updated.length;
    setOverallRating(Math.round(avg * 10) / 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      itemId: item.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      overallRating,
      dimensions,
      comment,
      createdAt: new Date().toISOString(),
      verifiedVisit,
    };

    storageService.addReview(newReview);
    onReviewSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-bottom duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Avaliar Estabelecimento</h2>
            <p className="text-xs text-neutral-500 line-clamp-1">{item.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Note on Localz Score Integrity */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Suas notas alimentam o <strong>Localz Score</strong>. O algoritmo é 100% transparente e nenhuma empresa pode comprar pontuação.
            </span>
          </div>

          {/* Overall Rating preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-xs font-bold text-neutral-700">Nota Geral Calculada:</span>
            <div className="flex items-center gap-1 text-emerald-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="text-base font-extrabold">{overallRating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          {/* Dimensions Sliders */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Critérios Específicos para {item.category.replace('_', ' ').toUpperCase()}
            </h4>

            {dimensions.map((dim, idx) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-700">{dim.label}</span>
                  <span className="font-bold text-emerald-700">{dim.rating} estrelas</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleDimensionChange(idx, star)}
                      className="p-1 hover:scale-120 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= dim.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Seu relato / opinião sincera *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o atendimento, prato recomendado, facilidade de estacionamento..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Verified visit toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedVisit}
              onChange={(e) => setVerifiedVisit(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            Confirmo que estive no local ou usei este serviço
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-sm text-white shadow-xs transition"
          >
            Publicar Avaliação
          </button>
        </form>
      </div>
    </div>
  );
};
