import React from 'react';
import {
  X,
  FileText,
  Award,
  TrendingDown,
  Droplets,
  TreeDeciduous,
  ShieldCheck,
  Building,
  Heart,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const WeeklyReportModal: React.FC = () => {
  const { activeModal, setActiveModal, weeklyReport, commanderProfile, clan } =
    useGame();

  if (activeModal !== 'weekly_report') return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-2xl shadow-md">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Boletim Semanal de Desempenho Climático
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {weeklyReport.weekId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Relatório Oficial da Secretaria do Meio Ambiente e Defesa Civil
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Commander & Clan Header Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{commanderProfile.avatar}</span>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <span>{commanderProfile.commanderName}</span>
                  <span className="text-xs text-purple-400">
                    [{clan.tag}]
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {commanderProfile.title}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Classificação Semanal
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {weeklyReport.statusGrade}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
                <Heart className="w-3.5 h-3.5" />
                Vidas Salvas
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {weeklyReport.livesSaved}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Idosos e crianças
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <TreeDeciduous className="w-3.5 h-3.5" />
                Ipês Plantados
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {weeklyReport.ipeTreesPlanted} mudas
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Arborização Urbana
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Redução Térmica
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                -{weeklyReport.avgTempReductionCelsius}°C
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Evapotranspiração
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                MP2.5 Filtrado
              </div>
              <div className="text-xl font-bold font-mono text-indigo-300">
                {weeklyReport.mp25ParticlesFilteredKg} kg
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Fuligem neutralizada
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
                <Droplets className="w-3.5 h-3.5" />
                Água Manejada
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {(weeklyReport.floodWaterManagedLiters / 1000).toFixed(0)}k L
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Cisternas e diques
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold mb-1">
                <Award className="w-3.5 h-3.5" />
                Ranking Nacional
              </div>
              <div className="text-xl font-bold font-mono text-yellow-300">
                #{weeklyReport.nationalRank} Brasil
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Top 1% de resiliência
              </div>
            </div>
          </div>

          {/* Official Secretariat Bulletin Note */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <FileText className="w-4 h-4" />
              Parecer Técnico Oficial:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{weeklyReport.officialSecretariatNotice}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs px-5">
          <span className="text-slate-400">
            Período de Avaliação: {weeklyReport.period}
          </span>
          <span className="font-bold text-emerald-400">
            +3.450 Bio-Créditos Concedidos
          </span>
        </div>
      </div>
    </div>
  );
};
