import React from 'react';
import { Shield, Sparkles, Wind, Users, Award, Play } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    sound.playVictory();
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-8 bg-slate-950/70 backdrop-blur-xs select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-emerald-400">
              Guardiões 3D
            </h2>
            <p className="text-xs text-slate-400">Simulador de Resiliência Climática do Cerrado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800/80 text-emerald-400 border border-emerald-500/30">
            v2.4 Oficial · LGPD & ECA Seguro
          </span>
        </div>
      </div>

      {/* Hero Center Lockup */}
      <div className="max-w-2xl mx-auto text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Defesa Civil & Educação Ambiental PSE</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">
          GUARDIÕES <span className="text-emerald-400">3D</span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8">
          Proteja Goiânia e cidades do Cerrado de ondas de calor de <strong className="text-amber-400">42°C</strong>,
          fumaça de queimadas com <strong className="text-amber-400">MP2.5</strong> e enchentes do{' '}
          <strong className="text-cyan-400">Rio Meia Ponte</strong>. Cuide de cidadãos vivos (The Sims), monte seu
          clã, negocie mudas de Ipê e lidere seu esquadrão em tempo real.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>INICIAR MISSÃO</span>
          </button>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
            <Users className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="text-xs font-bold text-slate-200">Cidadãos Vivos</div>
            <div className="text-[11px] text-slate-400">Pedrinho, Dona Maria e Beatriz</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
            <Wind className="w-4 h-4 text-amber-400 mb-1" />
            <div className="text-xs font-bold text-slate-200">Eventos Extremos</div>
            <div className="text-[11px] text-slate-400">Partículas MP2.5 e 42°C</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
            <Shield className="w-4 h-4 text-cyan-400 mb-1" />
            <div className="text-xs font-bold text-slate-200">Esquadrão Amigos</div>
            <div className="text-[11px] text-slate-400">Personalize seu esquadrão</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
            <Award className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-xs font-bold text-slate-200">Clãs & Mercado</div>
            <div className="text-[11px] text-slate-400">Bio-Créditos e duelos 1v1</div>
          </div>
        </div>
      </div>

      {/* Single Flat Control Hint Line */}
      <div className="text-center text-xs text-slate-400 font-mono tracking-wide py-2">
        WASD Mover Câmera · Scroll Zoom · Clique para Cuidar · Espaço Pausa · Esc Menu
      </div>
    </div>
  );
};
