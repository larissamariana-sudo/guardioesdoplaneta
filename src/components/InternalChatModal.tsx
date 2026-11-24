import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Shield,
  AlertTriangle,
  Radio,
  Lock,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const InternalChatModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    chatMessages,
    sendChatMessage,
    sendClanSos,
    commanderProfile,
    clan,
  } = useGame();

  const [channel, setChannel] = useState<'global' | 'clan' | 'alert'>('clan');
  const [inputText, setInputText] = useState('');

  if (activeModal !== 'chat') return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText, channel === 'alert' ? 'clan' : channel);
    setInputText('');
  };

  const handleQuickPreset = (text: string) => {
    sendChatMessage(text, channel === 'alert' ? 'clan' : channel);
  };

  const filteredMessages = chatMessages.filter((m) => {
    if (channel === 'alert') return m.channel === 'alert';
    if (channel === 'clan') return m.channel === 'clan' || m.channel === 'alert';
    return m.channel === 'global';
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Chat Tático Interno em Tempo Real
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Restrito ao Jogo · ECA Digital
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Comunicação segura e tática entre esquadrões de mitigação
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

        {/* Channel Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setChannel('clan')}
            className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              channel === 'clan'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Tático do Clã [{clan.tag}]
          </button>

          <button
            onClick={() => setChannel('global')}
            className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              channel === 'global'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Global (Cerrado)
          </button>

          <button
            onClick={() => setChannel('alert')}
            className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              channel === 'alert'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Defesa Civil 40199
          </button>
        </div>

        {/* Quick Tactic Presets */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Tático:</span>
          <button
            onClick={() => handleQuickPreset('💧 Água fresca entregue aos moradores!')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 shrink-0 cursor-pointer"
          >
            💧 Água entregue
          </button>
          <button
            onClick={() => handleQuickPreset('😷 Máscaras PFF2 distribuídas no setor escolar!')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 shrink-0 cursor-pointer"
          >
            😷 PFF2 distribuída
          </button>
          <button
            onClick={() => handleQuickPreset('🌱 Mudas de Ipê plantadas! Temperatura caindo.')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 shrink-0 cursor-pointer"
          >
            🌱 Ipês plantados
          </button>
          <button
            onClick={sendClanSos}
            className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 shrink-0 font-bold cursor-pointer"
          >
            🚨 Enviar SOS
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderName === commanderProfile.commanderName;
            const isAlert = msg.channel === 'alert' || msg.isSos;

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl text-xs ${
                  isAlert
                    ? 'bg-red-950/40 border border-red-500/40 text-red-200'
                    : isMe
                    ? 'bg-emerald-950/40 border border-emerald-500/40 ml-6 text-emerald-100'
                    : 'bg-slate-800/60 border border-slate-700/50 mr-6 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                      [{msg.clanTag}]
                    </span>
                    <span className="text-white">{msg.senderName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {msg.time}
                  </span>
                </div>
                <div className="leading-relaxed">{msg.text}</div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              channel === 'clan'
                ? `Mensagem tática para o clã [${clan.tag}]...`
                : 'Mensagem para a rede de guardiões...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
