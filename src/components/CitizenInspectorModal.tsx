import React from 'react';
import {
  X,
  Heart,
  Droplets,
  ShieldAlert,
  Home,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const CitizenInspectorModal: React.FC = () => {
  const {
    selectedCitizen,
    selectCitizenById,
    offerColdWater,
    equipPff2Mask,
    sendToClinicUbs,
    commanderProfile,
    currentWeather,
  } = useGame();

  if (!selectedCitizen) return null;

  const isLowHealth = selectedCitizen.health < 40;
  const isDehydrated = selectedCitizen.hydration < 40;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Citizen Avatar & Role */}
        <div className="relative p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              {selectedCitizen.avatarIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {selectedCitizen.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {selectedCitizen.age} anos
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-400">
                {selectedCitizen.roleLabel}
              </p>
            </div>
          </div>

          <button
            onClick={() => selectCitizenById(null)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Message */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Condição Atual:</span>{' '}
              {selectedCitizen.statusText}
            </div>
          </div>

          {/* Physiological Vitals (Hydration & Health) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hydration Bar */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Droplets className="w-3.5 h-3.5" />
                  Hidratação
                </span>
                <span className="font-mono font-bold text-white">
                  {selectedCitizen.hydration}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDehydrated ? 'bg-red-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${selectedCitizen.hydration}%` }}
                />
              </div>
              {isDehydrated && (
                <div className="text-[10px] text-red-400 font-medium mt-1">
                  Estresse térmico detectado!
                </div>
              )}
            </div>

            {/* Health Bar */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Heart className="w-3.5 h-3.5" />
                  Saúde Geral
                </span>
                <span className="font-mono font-bold text-white">
                  {selectedCitizen.health}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isLowHealth ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${selectedCitizen.health}%` }}
                />
              </div>
              {selectedCitizen.hasPff2Mask && (
                <div className="text-[10px] text-indigo-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Máscara PFF2 ativa
                </div>
              )}
            </div>
          </div>

          {/* Vulnerability & Bio Note */}
          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <p className="mb-1 text-slate-300 font-medium">{selectedCitizen.bio}</p>
            <p className="text-amber-300/90 italic">
              <strong>Vulnerabilidade:</strong> {selectedCitizen.vulnerabilityNote}
            </p>
          </div>

          {/* Real-time Care Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Ações Imediatas de Cuidado
            </h4>

            <div className="space-y-2">
              {/* Action 1: Offer Cold Water */}
              <button
                onClick={() => offerColdWater(selectedCitizen.id)}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/30 hover:from-cyan-900/60 hover:to-blue-900/50 border border-cyan-500/30 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-lg">
                    💧
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-200">
                      Oferecer Água Gelada da Cisterna
                    </div>
                    <div className="text-[11px] text-cyan-300/80">
                      +40% de Hidratação · Previne choque térmico
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    12 Bio-Créditos
                  </span>
                </div>
              </button>

              {/* Action 2: Equip PFF2 Mask */}
              <button
                onClick={() => equipPff2Mask(selectedCitizen.id)}
                disabled={selectedCitizen.hasPff2Mask}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer group ${
                  selectedCitizen.hasPff2Mask
                    ? 'bg-slate-800/40 border-slate-700/40 opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-900/40 to-indigo-900/30 hover:from-purple-900/60 hover:to-indigo-900/50 border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg">
                    😷
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-200">
                      {selectedCitizen.hasPff2Mask
                        ? 'Máscara PFF2 Já Equipada'
                        : 'Entregar Máscara Facial PFF2'}
                    </div>
                    <div className="text-[11px] text-purple-300/80">
                      Protege alvéolos contra fuligem MP2.5 e cinzas
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    20 Bio-Créditos
                  </span>
                </div>
              </button>

              {/* Action 3: Send to Clinic UBS (for low health) */}
              <button
                onClick={() => sendToClinicUbs(selectedCitizen.id)}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-red-900/30 to-rose-900/20 hover:from-red-900/50 hover:to-rose-900/40 border border-red-500/30 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center text-lg">
                    🚑
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-red-200">
                      Encaminhar para Polo Respiratório UBS
                    </div>
                    <div className="text-[11px] text-red-300/80">
                      Nebulização clínica e oxigênio de emergência
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-emerald-400">
                    Gratuito (SUS/PSE)
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Balance */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs px-5">
          <span className="text-slate-400">Seu Saldo:</span>
          <span className="font-bold text-amber-400 font-mono">
            {commanderProfile.bioCredits} Bio-Créditos
          </span>
        </div>
      </div>
    </div>
  );
};
