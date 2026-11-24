import React from 'react';
import { AlertTriangle, Volume2, ShieldAlert } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../audio/soundEngine';

export const DefenseCivilAlertBanner: React.FC = () => {
  const { currentWeather } = useGame();

  if (currentWeather.type === 'clear') return null;

  const isSevere = currentWeather.severity === 3;

  return (
    <div
      className={`w-full py-1.5 px-4 flex items-center justify-between text-xs font-semibold shadow-md border-b select-none transition-colors duration-300 ${
        isSevere
          ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
          : 'bg-blue-950/90 text-blue-200 border-blue-500/50'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white font-bold tracking-wider text-[10px] uppercase animate-none">
          <ShieldAlert className="w-3 h-3" />
          DEFESA CIVIL {currentWeather.defenseAlertCode}
        </span>

        <span className="font-bold text-white tracking-wide">
          {currentWeather.title}:
        </span>

        <span className="text-slate-300 hidden sm:inline">
          {currentWeather.tagline}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => sound.playAlertSiren()}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-[11px] border border-amber-500/30 cursor-pointer"
          title="Tocar Sirene Oficial 40199"
        >
          <Volume2 className="w-3 h-3" />
          <span className="hidden md:inline">Sirene 40199</span>
        </button>

        <span className="font-mono text-[11px] bg-slate-900/90 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
          {Math.floor(currentWeather.remainingSec / 60)}:
          {String(currentWeather.remainingSec % 60).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
