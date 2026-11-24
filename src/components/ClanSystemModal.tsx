import React, { useState } from 'react';
import {
  X,
  Shield,
  Swords,
  AlertOctagon,
  Users,
  Award,
  Crown,
  CheckCircle,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ClanSystemModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    clan,
    updateClanInfo,
    sendClanSos,
    conductLeaderDuel1v1,
    commanderProfile,
  } = useGame();

  const [isEditingClan, setIsEditingClan] = useState(false);
  const [editName, setEditName] = useState(clan.name);
  const [editTag, setEditTag] = useState(clan.tag);
  const [editMotto, setEditMotto] = useState(clan.motto);

  if (activeModal !== 'clan') return null;

  const handleSaveClan = (e: React.FormEvent) => {
    e.preventDefault();
    updateClanInfo(editName, editMotto, editTag);
    setIsEditingClan(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-2xl shadow-md">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  [{clan.tag}] {clan.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Nível {clan.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">"{clan.motto}"</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingClan(!isEditingClan)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer text-xs flex items-center gap-1"
              title="Personalizar Clã"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Edit Clan Section */}
          {isEditingClan && (
            <form
              onSubmit={handleSaveClan}
              className="p-4 rounded-xl bg-slate-800 border border-purple-500/40 space-y-3"
            >
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                Personalizar Dados da Guilda / Clã
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Nome do Clã
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Tag da Guilda (até 8 letras)
                  </label>
                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Lema Oficial do Clã
                </label>
                <input
                  type="text"
                  value={editMotto}
                  onChange={(e) => setEditMotto(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingClan(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Clã
                </button>
              </div>
            </form>
          )}

          {/* Tactical SOS Button & 1v1 Leader Duel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tactical SOS Button */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/60 to-slate-900 border border-red-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <AlertOctagon className="w-4 h-4" />
                  Botão SOS da Guilda
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dispara um sinal sonoro de emergência civil no canal tático do clã convocando reforço imediato de água e brigadistas.
                </p>
              </div>
              <button
                onClick={sendClanSos}
                className="mt-3 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <AlertOctagon className="w-4 h-4" />
                DISPARAR SOS TÁTICO
              </button>
            </div>

            {/* 1v1 Leader Challenge */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Swords className="w-4 h-4" />
                  Duelo 1v1 entre Líderes
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Desafie o Líder de <strong>{clan.rivalClanName}</strong> em um duelo relâmpago de contenção de crise climática!
                </p>
              </div>
              <button
                onClick={conductLeaderDuel1v1}
                className="mt-3 w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Crown className="w-4 h-4" />
                DUELAR 1v1 (+450 Pts Clã)
              </button>
            </div>
          </div>

          {/* Weekly Clan Competition Banner */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Competição Semanal Inter-Guildas
                </span>
                <h4 className="text-sm font-bold text-white">
                  {clan.weeklyWarGoal.title}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-400">
                  Recompensa: +{clan.weeklyWarGoal.rewardBioCredits} Bio-C
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {clan.weeklyWarGoal.description}
            </p>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Progresso da Guilda:</span>
                <span className="text-emerald-400 font-bold">
                  {clan.weeklyWarGoal.current} / {clan.weeklyWarGoal.target} Ipês
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{
                    width: `${(clan.weeklyWarGoal.current / clan.weeklyWarGoal.target) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Clan vs Rival Score Matchup */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60 text-center">
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[11px] text-emerald-400 font-bold">
                  [{clan.tag}] {clan.name}
                </div>
                <div className="text-lg font-black font-mono text-white">
                  {clan.weeklyScore} pts
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <div className="text-[11px] text-slate-400 font-bold">
                  [RIVAL] {clan.rivalClanName}
                </div>
                <div className="text-lg font-black font-mono text-slate-300">
                  {clan.rivalScore} pts
                </div>
              </div>
            </div>
          </div>

          {/* Members Hierarchy List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Membros & Hierarquia do Clã ({clan.members.length})
              </h4>
            </div>

            <div className="space-y-1.5">
              {clan.members.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{member.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {member.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            member.role === 'Líder'
                              ? 'bg-amber-500/20 text-amber-400'
                              : member.role === 'Oficial'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {member.treesPlanted} Ipês plantados
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {member.score} pts
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {member.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
