import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Award,
  Send,
  Sparkles,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../audio/soundEngine';

export const SocialFeedModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    socialPosts,
    toggleLikeSocialPost,
    createSocialPost,
    badges,
    shareBadgeOnFeed,
    commanderProfile,
    clan,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'feed' | 'badges'>('feed');
  const [newPostText, setNewPostText] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  if (activeModal !== 'social') return null;

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    createSocialPost(newPostText);
    setNewPostText('');
  };

  const handleCopyChallengeLink = () => {
    sound.playClick();
    const challengeText = `🛡️ Desafio Guardiões 3D: Eu, ${commanderProfile.commanderName} do clã [${clan.tag}], desafio você a conter uma onda de calor de 42°C em Goiânia e salvar Dona Maria e Pedrinho! Acesse o jogo e supere meus ${commanderProfile.totalScore} pontos!`;
    navigator.clipboard?.writeText(challengeText);
    setCopiedChallenge(true);
    setTimeout(() => setCopiedChallenge(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900/60 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-2xl shadow-md">
              🌐
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Feed Social & Mural de Conquistas
              </h3>
              <p className="text-xs text-slate-400">
                Compartilhe medalhas, desafios e vitórias comunitárias no Cerrado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChallengeModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5" />
              Desafiar Amigos
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'feed'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Feed da Comunidade ({socialPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'badges'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Mural de Medalhas & Troféus ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </button>
        </div>

        {/* Tab 1: Feed */}
        {activeTab === 'feed' && (
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Create Post Input */}
            <form
              onSubmit={handleSubmitPost}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{commanderProfile.avatar}</span>
                <input
                  type="text"
                  placeholder="Compartilhe uma ação de resiliência climática com a guilda..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar no Feed
                </button>
              </div>
            </form>

            {/* Posts List */}
            <div className="space-y-3">
              {socialPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{post.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {post.authorName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-blue-300 font-mono">
                            [{post.clanTag}]
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {post.authorRole} · {post.timeAgo}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Attached Badge if any */}
                  {post.badgeAttachment && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                      <span className="text-2xl">{post.badgeAttachment.icon}</span>
                      <div>
                        <div className="font-bold">
                          Medalha: {post.badgeAttachment.title}
                        </div>
                        <div className="text-[10px] text-amber-400/80">
                          Conquista Oficial de Guardiões 3D
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Like button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs">
                    <button
                      onClick={() => toggleLikeSocialPost(post.id)}
                      className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                        post.liked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${post.liked ? 'fill-current' : ''}`}
                      />
                      <span>{post.likes} Curtidas</span>
                    </button>

                    <span className="text-[10px] text-slate-500">
                      Cerrado Resiliente · LGPD Seguro
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Badges & Trophies */}
        {activeTab === 'badges' && (
          <div className="p-5 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Exiba suas medalhas conquistadas em seu feed pessoal para incentivar outros jogadores!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-950/30 via-slate-800 to-slate-800 border-amber-500/40'
                      : 'bg-slate-800/40 border-slate-700/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        badge.unlocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">
                          {badge.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-purple-400 font-medium">
                        {badge.category}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400">
                      +{badge.rewardBioCredits} Bio-Créditos
                    </span>

                    {badge.unlocked ? (
                      <button
                        onClick={() => shareBadgeOnFeed(badge.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        Exibir no Feed
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Progresso: {badge.progress}/{badge.maxProgress}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Desafio de Amigos */}
        {showChallengeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <h4 className="text-sm font-bold text-white">
                    Desafiar Outros Jogadores
                  </h4>
                </div>
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Convide amigos para testar a resiliência deles! Quem salvar mais cidadãos da onda de 42°C e plantar mais Ipês no Cerrado vence.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 leading-relaxed">
                "Desafio Guardiões 3D: Eu, {commanderProfile.commanderName} do clã [{clan.tag}], desafio você a conter uma crise climática e bater meu recorde de {commanderProfile.totalScore} pontos!"
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCopyChallengeLink}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {copiedChallenge ? (
                    <>
                      <Check className="w-4 h-4" />
                      Texto do Desafio Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Desafio para Enviar aos Amigos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
