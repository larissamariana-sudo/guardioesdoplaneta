import React from 'react';
import { X, Thermometer, TreeDeciduous, Users, Sparkles, Droplets } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const BuildingInspectorModal: React.FC = () => {
  const {
    selectedBuilding,
    selectBuildingById,
    plantIpeInBuilding,
    citizens,
    selectCitizenById,
    commanderProfile,
  } = useGame();

  if (!selectedBuilding) return null;

  const residentCitizens = citizens.filter((c) =>
    selectedBuilding.residents.includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              {selectedBuilding.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {selectedBuilding.name}
              </h3>
              <p className="text-xs text-slate-400 capitalize">
                {selectedBuilding.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => selectBuildingById(null)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Temperature & Microclimate Readout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                <Thermometer className="w-3.5 h-3.5" />
                Temp. Interna
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {selectedBuilding.currentTemp}°C
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {selectedBuilding.treesPlanted > 0
                  ? `-${selectedBuilding.treesPlanted * 3}°C por Ipês`
                  : 'Sem sombreamento ativo'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <TreeDeciduous className="w-3.5 h-3.5" />
                Ipês no Quintal
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {selectedBuilding.treesPlanted} mudas
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Evapotranspiração ativa
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {selectedBuilding.description}
          </div>

          {/* Residents List */}
          {residentCitizens.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Users className="w-3.5 h-3.5" />
                Moradores / Usuários Frequentes
              </div>
              <div className="space-y-1.5">
                {residentCitizens.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCitizenById(c.id)}
                    className="w-full p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.avatarIcon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.roleLabel}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono">
                      <span className="text-cyan-400">{c.hydration}% 💧</span> ·{' '}
                      <span className="text-emerald-400">{c.health}% 💖</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Action: Plant Ipê tree in backyard */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Ação de Preservação Urbana
            </h4>
            <button
              onClick={() => plantIpeInBuilding(selectedBuilding.id)}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-900/50 to-teal-900/40 hover:from-emerald-900/70 hover:to-teal-900/60 border border-emerald-500/40 flex items-center justify-between text-left transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl">
                  🌱
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-200">
                    Plantar Ipê Amarelo no Quintal
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Reduz até 3°C por evapotranspiração + avança meta do Clã
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 font-mono">
                  35 Bio-Créditos
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs px-5">
          <span className="text-slate-400">Saldo:</span>
          <span className="font-bold text-amber-400 font-mono">
            {commanderProfile.bioCredits} Bio-Créditos
          </span>
        </div>
      </div>
    </div>
  );
};
