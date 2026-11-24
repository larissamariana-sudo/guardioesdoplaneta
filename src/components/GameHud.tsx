import React, { useState } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Camera,
  Coins,
  Thermometer,
  Wind,
  Droplets,
  Waves,
  ChevronDown,
  ChevronUp,
  Users,
  Store,
  Award,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DefenseCivilAlertBanner } from './DefenseCivilAlertBanner';
import { sound } from '../audio/soundEngine';
import { WeatherEventType } from '../types/game';

interface GameHudProps {
  onSelectCameraPreset: (
    preset: 'overview' | 'residential' | 'community' | 'park' | 'river'
  ) => void;
  onSwitchWeather: (type: WeatherEventType) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  onSelectCameraPreset,
  onSwitchWeather,
}) => {
  const {
    currentWeather,
    commanderProfile,
    heroes,
    triggerHeroSkill,
    isAudioMuted,
    toggleAudioMute,
    isPaused,
    setIsPaused,
    setActiveModal,
    activeModal,
    cameraPreset,
    setCameraPreset,
    totalTreesPlanted,
    clan,
  } = useGame();

  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const handleCameraChange = (
    preset: 'overview' | 'residential' | 'community' | 'park' | 'river'
  ) => {
    sound.playClick();
    setCameraPreset(preset);
    onSelectCameraPreset(preset);
  };

  const handleWeatherChange = (type: WeatherEventType) => {
    sound.playClick();
    onSwitchWeather(type);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden z-20">
      {/* 1. TOP PERIMETER STATUS CLUSTER (Low occlusion) */}
      <div className="w-full pointer-events-auto">
        <DefenseCivilAlertBanner />

        <div className="px-4 py-2 flex items-center justify-between gap-2 bg-slate-950/80 border-b border-slate-800 text-xs">
          {/* Left: Weather Readouts */}
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-mono font-bold">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums">{currentWeather.temperature.toFixed(1)}°C</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              <Wind className="w-3.5 h-3.5 text-indigo-400" />
              <span>MP2.5:</span>
              <span className={`font-bold tabular-nums ${currentWeather.mp25 > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                {currentWeather.mp25} µg/m³
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono hidden sm:flex">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Umidade:</span>
              <span className="font-bold tabular-nums text-cyan-300">
                {currentWeather.humidity}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono hidden md:flex">
              <Waves className="w-3.5 h-3.5 text-blue-400" />
              <span>Rio Meia Ponte:</span>
              <span className="font-bold tabular-nums text-blue-300">
                {currentWeather.riverLevel.toFixed(1)}m
              </span>
            </div>
          </div>

          {/* Right: Balance, Audio & Pause Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bio-Credits */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="tabular-nums">{commanderProfile.bioCredits} Bio-C</span>
            </div>

            {/* Clan Tag Pill */}
            <button
              onClick={() => setActiveModal('clan')}
              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-[11px] font-bold cursor-pointer hidden sm:flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>[{clan.tag}]</span>
            </button>

            {/* Mute Audio */}
            <button
              onClick={toggleAudioMute}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title={isAudioMuted ? 'Ativar Som' : 'Silenciar Som'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause Simulation */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title={isPaused ? 'Continuar Simulação' : 'Pausar Simulação'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. UNOBSTRUCTED PLAYFIELD CENTER (Zero floating side clutter) */}
      <div className="flex-1" />

      {/* 3. COLLAPSIBLE BOTTOM DOCK (Consolidated Controls & Navigation) */}
      <div className="pointer-events-auto flex flex-col items-center pb-4 px-3 w-full">
        {/* Collapse Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="px-4 py-1 rounded-t-xl bg-slate-900/90 hover:bg-slate-800 border-t border-x border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expandir Controles do Esquadrão (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Modo Cinema / Recolher Dock</span>
            </>
          )}
        </button>

        {/* Unified Bottom Dock */}
        {!isDockCollapsed && (
          <div className="w-full max-w-4xl bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 backdrop-blur-none">
            {/* Row 1: Esquadrão de Heróis (User + Friends Skills) */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 hidden sm:inline">
                Esquadrão:
              </span>

              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                {heroes.map((hero) => {
                  const onCooldown = hero.currentCooldown > 0;
                  const canAfford = commanderProfile.bioCredits >= hero.bioCreditCost;

                  return (
                    <button
                      key={hero.id}
                      onClick={() => triggerHeroSkill(hero.id)}
                      disabled={onCooldown || !canAfford}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 text-left transition-all shrink-0 cursor-pointer ${
                        onCooldown
                          ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-850 hover:to-slate-750 border-emerald-500/40 hover:border-emerald-400 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                      title={`${hero.name} (${hero.friendRole}): ${hero.skillDesc}`}
                    >
                      <div className="text-xl relative">
                        {hero.avatar}
                        {onCooldown && (
                          <div className="absolute inset-0 bg-slate-950/80 rounded flex items-center justify-center font-mono font-bold text-[10px] text-amber-400">
                            {hero.currentCooldown}s
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">
                            {hero.name}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {hero.bioCreditCost}C
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                          {hero.skillName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Weather Cycle Test Switcher */}
              <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 hidden md:inline">Clima:</span>
                <button
                  onClick={() => handleWeatherChange('heatwave')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${currentWeather.type === 'heatwave' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-300'}`}
                  title="Ativar Onda de Calor 42°C"
                >
                  42°C
                </button>
                <button
                  onClick={() => handleWeatherChange('wildfire')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${currentWeather.type === 'wildfire' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-orange-300'}`}
                  title="Ativar Focos de Queimada MP2.5"
                >
                  MP2.5
                </button>
                <button
                  onClick={() => handleWeatherChange('flood')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${currentWeather.type === 'flood' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-300'}`}
                  title="Ativar Enchente do Meia Ponte"
                >
                  Rio
                </button>
                <button
                  onClick={() => handleWeatherChange('clear')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${currentWeather.type === 'clear' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-300'}`}
                  title="Ativar Clima Claro e Ameno"
                >
                  Ameno
                </button>
              </div>
            </div>

            {/* Row 2: Camera Presets & Main Modals Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              {/* Camera Views */}
              <div className="flex items-center gap-1 text-[11px]">
                <Camera className="w-3.5 h-3.5 text-slate-400 mr-1" />
                <button
                  onClick={() => handleCameraChange('overview')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${cameraPreset === 'overview' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Geral
                </button>
                <button
                  onClick={() => handleCameraChange('residential')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${cameraPreset === 'residential' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Moradias
                </button>
                <button
                  onClick={() => handleCameraChange('community')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${cameraPreset === 'community' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Escola / UBS
                </button>
                <button
                  onClick={() => handleCameraChange('park')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${cameraPreset === 'park' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Parque Ipês
                </button>
                <button
                  onClick={() => handleCameraChange('river')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${cameraPreset === 'river' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  Meia Ponte
                </button>
              </div>

              {/* Main Modals Navigation */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Mercado */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'market' ? null : 'market');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'market' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'}`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mercado</span>
                </button>

                {/* Clã & Guerra */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'clan' ? null : 'clan');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'clan' ? 'bg-purple-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Clã & Guerra</span>
                </button>

                {/* Feed & Medalhas */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'social' ? null : 'social');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'social' ? 'bg-blue-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30'}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Mural & Feed</span>
                </button>

                {/* Chat / SOS */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'chat' ? null : 'chat');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'chat' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat / SOS</span>
                </button>

                {/* Relatório Semanal */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'weekly_report' ? null : 'weekly_report');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'weekly_report' ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Boletim</span>
                </button>

                {/* Perfil & LGPD */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveModal(activeModal === 'profile' ? null : 'profile');
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeModal === 'profile' ? 'bg-slate-200 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Perfil</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
