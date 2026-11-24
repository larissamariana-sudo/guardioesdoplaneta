import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Award,
  Users,
  Lock,
  Save,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../audio/soundEngine';

export const CommanderProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    commanderProfile,
    updateCommanderProfile,
    heroes,
    updateHeroName,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'profile' | 'squad' | 'lgpd'>('profile');

  // Form states
  const [name, setName] = useState(commanderProfile.commanderName);
  const [title, setTitle] = useState(commanderProfile.title);
  const [avatar, setAvatar] = useState(commanderProfile.avatar);
  const [motto, setMotto] = useState(commanderProfile.motto);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Friend heroes editing
  const [heroNames, setHeroNames] = useState<Record<string, string>>({
    hero_commander: heroes[0]?.name || 'Larissa',
    hero_carlos: heroes[1]?.name || 'Carlos',
    hero_marina: heroes[2]?.name || 'Marina',
    hero_thiago: heroes[3]?.name || 'Thiago',
  });

  if (activeModal !== 'profile') return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    updateCommanderProfile({
      commanderName: name,
      title,
      avatar,
      motto,
    });
    // Also update main hero name
    updateHeroName('hero_commander', name);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveSquad = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    Object.entries(heroNames).forEach(([id, hName]) => {
      updateHeroName(id, hName);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const AVATAR_OPTIONS = ['👩‍🔬', '👨‍🚒', '👩‍⚕️', '👨‍🌾', '🧑‍🚀', '🌿', '🦁', '🦅'];
  const TITLE_OPTIONS = [
    'Comandante de Resiliência do Cerrado',
    'Guardião Supremo do Meia Ponte',
    'Estrategista de Defesa Civil',
    'Climatologista Chefe de Campo',
    'Protetor das Águas e Nascentes',
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-2xl shadow-md">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Perfil do Comandante & Esquadrão
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Nível {commanderProfile.level}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalize sua identidade e insira o nome dos seus amigos no esquadrão
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Perfil & Títulos
          </button>

          <button
            onClick={() => setActiveTab('squad')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'squad'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Nome dos Amigos (Esquadrão)
          </button>

          <button
            onClick={() => setActiveTab('lgpd')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'lgpd'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            LGPD & ECA Digital
          </button>
        </div>

        {/* Tab 1: Profile & Titles */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="p-5 overflow-y-auto space-y-4"
          >
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Alterações de perfil salvas com sucesso!
              </div>
            )}

            {/* Avatar Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Avatar Temático do Comandante
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center cursor-pointer transition-all ${
                      avatar === av
                        ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110 shadow-lg'
                        : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Seu Nome de Comandante
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Título Científico / Militar
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                >
                  {TITLE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Motto */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Lema Pessoal do Guardião
              </label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            {/* Level & XP Progression */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">
                  Progressão de Nível
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {commanderProfile.xp} / {commanderProfile.nextLevelXp} XP (Nível{' '}
                  {commanderProfile.level})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${(commanderProfile.xp / commanderProfile.nextLevelXp) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Save className="w-4 h-4" />
                Salvar Meu Perfil
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Friend Heroes Squad */}
        {activeTab === 'squad' && (
          <form
            onSubmit={handleSaveSquad}
            className="p-5 overflow-y-auto space-y-4"
          >
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Nomes do esquadrão atualizados com sucesso!
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              Personalize os nomes dos 4 heróis do seu esquadrão tático com o seu nome e os de seus amigos ou familiares:
            </p>

            <div className="space-y-3">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{hero.avatar}</span>
                    <div>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {hero.friendRole}
                      </span>
                      <div className="text-xs text-slate-400">
                        Habilidade: {hero.skillName}
                      </div>
                    </div>
                  </div>

                  <div className="w-48">
                    <input
                      type="text"
                      value={heroNames[hero.id] || hero.name}
                      onChange={(e) =>
                        setHeroNames((prev) => ({
                          ...prev,
                          [hero.id]: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Save className="w-4 h-4" />
                Salvar Nomes dos Amigos
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: LGPD & ECA Digital */}
        {activeTab === 'lgpd' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                Conformidade LGPD (Lei 13.709/2018) & ECA Digital
              </div>
              <p>
                O Guardiões 3D foi desenvolvido com foco estrito em segurança digital, proteção infantojuvenil e privacidade de dados:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h5 className="font-bold text-white mb-1">
                  1. Zero Coleta de Dados Sensíveis
                </h5>
                <p className="text-slate-400">
                  Nenhum dado pessoal sensível (como geolocalização por GPS precisa, documentos ou dados biométricos) é coletado, transmitido ou compartilhado com terceiros.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h5 className="font-bold text-white mb-1">
                  2. Armazenamento Seguro e Local
                </h5>
                <p className="text-slate-400">
                  Os nomes personalizados do usuário e de amigos permanecem no navegador do jogador, garantindo privacidade completa do esquadrão.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h5 className="font-bold text-white mb-1">
                  3. Chat e Comunidade Protegidos (ECA Digital)
                </h5>
                <p className="text-slate-400">
                  O ambiente de chat tático é 100% restrito ao jogo, sem capacidade de comunicação externa, troca de mídias ou links não autorizados, prevenindo exposição de crianças e adolescentes.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 text-center">
              Guardiões 3D: Resiliência Climática · Desenvolvido com padrões de software responsável.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
