import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  ShoppingBag,
  ArrowRightLeft,
  Plus,
  Coins,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const MarketModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    marketItems,
    buyMarketItem,
    clanTrades,
    createClanTradeOffer,
    buyClanTrade,
    commanderProfile,
    currentWeather,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'store' | 'clan_trades'>('store');
  const [newTradeItem, setNewTradeItem] = useState<string>('Muda de Ipê Amarelo Nativo');
  const [newTradeQty, setNewTradeQty] = useState<number>(1);
  const [newTradePrice, setNewTradePrice] = useState<number>(30);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  if (activeModal !== 'market') return null;

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    createClanTradeOffer(newTradeItem, newTradeQty, newTradePrice);
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Mercado Interno de Bio-Créditos
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Economia Dinâmica
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Preços ajustados em tempo real pela escassez e crise climática
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

        {/* Dynamic Weather Price Alert Bar */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>
              Clima Ativo:{' '}
              <strong className="text-white">{currentWeather.title}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-400">
              {commanderProfile.bioCredits} Bio-Créditos
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('store')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'store'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Itens de Sobrevivência & Preservação
          </button>

          <button
            onClick={() => setActiveTab('clan_trades')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'clan_trades'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Mural de Trocas do Clã ({clanTrades.length})
          </button>
        </div>

        {/* Tab 1: Survival Store */}
        {activeTab === 'store' && (
          <div className="p-5 overflow-y-auto space-y-3">
            {marketItems.map((item) => {
              const isHighDemand = item.demandFactor > 1.2;
              const isDiscount = item.demandFactor < 1.0;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        {isHighDemand && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                            Alta Demanda (+{Math.round((item.demandFactor - 1) * 100)}%)
                          </span>
                        )}
                        {isDiscount && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            Preço Promocional!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                      <p className="text-[11px] text-emerald-400 font-medium mt-1">
                        Efeito: {item.benefit}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Em seu inventário:{' '}
                        <span className="text-white font-bold">
                          {item.playerInventory} unidades
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-amber-400">
                        {item.currentPrice} Bio-C
                      </div>
                      {item.currentPrice !== item.basePrice && (
                        <div className="text-[10px] text-slate-400 line-through font-mono">
                          Base: {item.basePrice}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => buyMarketItem(item.id)}
                      disabled={commanderProfile.bioCredits < item.currentPrice || item.stock <= 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        commanderProfile.bioCredits >= item.currentPrice && item.stock > 0
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {item.stock <= 0 ? 'Esgotado' : 'Comprar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Clan Trades */}
        {activeTab === 'clan_trades' && (
          <div className="p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ofertas da Comunidade e Clã
                </h4>
                <p className="text-xs text-slate-400">
                  Economia colaborativa: troque recursos estratégicos entre membros
                </p>
              </div>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Oferta de Troca
              </button>
            </div>

            {/* Create Offer Form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreateOffer}
                className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/40 space-y-3"
              >
                <div className="text-xs font-bold text-emerald-400">
                  Publicar Lote no Mural da Guilda
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Item para Troca
                    </label>
                    <select
                      value={newTradeItem}
                      onChange={(e) => setNewTradeItem(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="Muda de Ipê Amarelo Nativo">Muda de Ipê Amarelo</option>
                      <option value="Máscara Facial PFF2 / N95">Máscara Facial PFF2</option>
                      <option value="Galão de Água Gelada (5L)">Galão de Água Gelada</option>
                      <option value="Bio-Larvicida BTI">Bio-Larvicida BTI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newTradeQty}
                      onChange={(e) => setNewTradeQty(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Preço Total (Bio-Créditos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={newTradePrice}
                      onChange={(e) => setNewTradePrice(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Publicar Oferta
                  </button>
                </div>
              </form>
            )}

            {/* List of Trades */}
            <div className="space-y-2">
              {clanTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{trade.itemIcon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {trade.quantity}x {trade.itemName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          [{trade.sellerClan}] {trade.sellerName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{trade.timestamp}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-amber-400">
                        {trade.price} Bio-C
                      </div>
                    </div>

                    {trade.isMyTrade ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium">
                        Sua Oferta
                      </span>
                    ) : (
                      <button
                        onClick={() => buyClanTrade(trade.id)}
                        disabled={commanderProfile.bioCredits < trade.price}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Comprar Lote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
