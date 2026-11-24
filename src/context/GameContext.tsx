/**
 * Main Game State Context for Guardiões 3D
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Citizen,
  Building,
  WeatherEvent,
  HeroMember,
  MarketItem,
  Clan,
  ClanTrade,
  AchievementBadge,
  SocialPost,
  ChatMessage,
  WeeklyPerformanceReport,
  CommanderProfile,
  WeatherEventType,
} from '../types/game';
import { sound } from '../audio/soundEngine';

// Pre-defined weather scenarios
const WEATHER_SCENARIOS: WeatherEvent[] = [
  {
    type: 'heatwave',
    title: 'Onda de Calor Extremo (42°C)',
    tagline: 'Massa de ar seco do Cerrado elevando temperaturas a níveis críticos',
    temperature: 42.2,
    mp25: 58,
    humidity: 11,
    riverLevel: 1.8,
    severity: 3,
    durationSec: 90,
    remainingSec: 90,
    defenseAlertCode: '40199',
    scientificContext:
      'Bloqueio atmosférico sobre o Planalto Central provoca baixa umidade (11%) e estresse térmico grave em idosos e crianças com risco de desidratação celular.',
    recommendedActions: [
      'Oferecer Água Gelada a idosos na cisterna',
      'Plantar Ipês nos quintais para reduzir calor residencial',
      'Ativar nebulização de praças públicas',
    ],
  },
  {
    type: 'wildfire',
    title: 'Focos de Queimada e Fumaça MP2.5',
    tagline: 'Fuligem e partículas inaláveis atingindo índices perigosos no ar',
    temperature: 36.8,
    mp25: 198,
    humidity: 16,
    riverLevel: 1.9,
    severity: 3,
    durationSec: 85,
    remainingSec: 85,
    defenseAlertCode: '40199',
    scientificContext:
      'Partículas finas MP2.5 ultrapassam 180µg/m³, penetrando alvéolos pulmonares. Crianças asmáticas como Pedrinho sofrem broncoespasmos imediatos sem proteção.',
    recommendedActions: [
      'Equipar Máscaras PFF2 em crianças e moradores',
      'Acionar Esquadrão Brigadista com abafadores',
      'Executar Semeadura de Nuvens para lavagem atmosférica',
    ],
  },
  {
    type: 'flood',
    title: 'Transbordamento do Rio Meia Ponte',
    tagline: 'Chuva torrencial de 120mm eleva vazão e inunda calçadas ribeirinhas',
    temperature: 23.4,
    mp25: 14,
    humidity: 94,
    riverLevel: 5.4,
    severity: 3,
    durationSec: 80,
    remainingSec: 80,
    defenseAlertCode: '40199',
    scientificContext:
      'Precipitação torrencial no leito do Meia Ponte gera risco de enxurrada. Rotas acessíveis são vitais para evacuação segura de cadeirantes como Beatriz.',
    recommendedActions: [
      'Montar barreiras de contenção e diques',
      'Guiar Beatriz pelas calçadas adaptadas elevadas',
      'Drenar água acumulada para a cisterna de reserva',
    ],
  },
  {
    type: 'dengue_outbreak',
    title: 'Risco de Surto: Aedes aegypti',
    tagline: 'Acúmulo de poças pós-enchente favorece rápida proliferação vetorial',
    temperature: 28.6,
    mp25: 22,
    humidity: 82,
    riverLevel: 2.3,
    severity: 2,
    durationSec: 75,
    remainingSec: 75,
    defenseAlertCode: '40199',
    scientificContext:
      'Ciclo biológico do mosquito encurtado pelo calor e água parada. O uso de bio-larvicida BTI impede a eclosão larval sem agredir o ecossistema.',
    recommendedActions: [
      'Aplicar Bio-Larvicida BTI nas poças',
      'Realizar mutirão comunitário de descarte de recipientes',
      'Mobilizar enfermeira da UBS para triagem de sintomas',
    ],
  },
  {
    type: 'clear',
    title: 'Clima Ameno & Biosfera em Recuperação',
    tagline: 'Brisa do Cerrado favorável para restauração e plantio sustentável',
    temperature: 27.0,
    mp25: 18,
    humidity: 55,
    riverLevel: 2.2,
    severity: 1,
    durationSec: 60,
    remainingSec: 60,
    defenseAlertCode: '40199',
    scientificContext:
      'Janela ideal para enriquecer o solo, regar mudas nativas de Baru e abastecer estoques de sobrevivência.',
    recommendedActions: [
      'Comprar mudas de Ipê a preço reduzido no mercado',
      'Organizar treinamentos na guilda',
      'Celebrar medalhas e avanços da comunidade',
    ],
  },
];

const INITIAL_CITIZENS: Citizen[] = [
  {
    id: 'cit_pedrinho',
    name: 'Pedrinho',
    age: 9,
    role: 'child_asthma',
    roleLabel: 'Criança (Asma Crônica)',
    avatarIcon: '👦',
    hydration: 85,
    health: 90,
    hasPff2Mask: false,
    statusText: 'Brincando no pátio escolar',
    isSheltered: false,
    homeId: 'house_pedrinho',
    position: { x: 18, z: -20 },
    targetPosition: { x: 18, z: -10 },
    color: '#eab308',
    bio: 'Estudante da Escola Municipal PSE. Adora ciências, mas tem crises de asma severa quando o ar atinge MP2.5 elevado.',
    vulnerabilityNote: 'Altamente vulnerável a fuligem e poeira. Precisa de máscara PFF2 imediatamente em caso de queimadas.',
  },
  {
    id: 'cit_maria',
    name: 'Dona Maria',
    age: 74,
    role: 'elderly',
    roleLabel: 'Idosa Moradora',
    avatarIcon: '👵',
    hydration: 70,
    health: 85,
    hasPff2Mask: false,
    statusText: 'Caminhando para a calçada',
    isSheltered: false,
    homeId: 'house_maria',
    position: { x: 24, z: -18 },
    targetPosition: { x: 8, z: -15 },
    color: '#c084fc',
    bio: 'Pioneira do bairro e guardiã de receitas tradicionais com pequi e baru. Sente fadiga intensa sob calor acima de 38°C.',
    vulnerabilityNote: 'Perde hidratação rapidamente em ondas de calor. Deve ser assistida na cisterna com água fresca.',
  },
  {
    id: 'cit_lucas',
    name: 'Lucas Mendes',
    age: 28,
    role: 'brigadist',
    roleLabel: 'Brigadista Voluntário',
    avatarIcon: '👨‍🚒',
    hydration: 95,
    health: 100,
    hasPff2Mask: true,
    statusText: 'Patrulhando com abafadores',
    isSheltered: false,
    homeId: 'brigade_station',
    position: { x: 15, z: 25 },
    targetPosition: { x: 20, z: 10 },
    color: '#ef4444',
    bio: 'Treinado pela Defesa Civil em contenção de incêndios florestais e primeiros socorros em áreas de risco.',
    vulnerabilityNote: 'Alta resistência física, lidera frentes operacionais de resgate.',
  },
  {
    id: 'cit_beatriz',
    name: 'Beatriz',
    age: 14,
    role: 'wheelchair_student',
    roleLabel: 'Estudante Cadeirante',
    avatarIcon: '🧑‍🦽',
    hydration: 90,
    health: 95,
    hasPff2Mask: false,
    statusText: 'Navegando pela rota acessível',
    isSheltered: false,
    homeId: 'house_beatriz',
    position: { x: 18, z: -2 },
    targetPosition: { x: 8, z: 5 },
    color: '#06b6d4',
    bio: 'Ativista juvenil por acessibilidade urbana e sustentabilidade no conselho escolar da Escola Pública / PSE.',
    vulnerabilityNote: 'Necessita de calçadas desobstruídas e rampas acessíveis durante enxurradas e enchentes do rio.',
  },
  {
    id: 'cit_joao',
    name: 'Seu João',
    age: 62,
    role: 'agroecologist',
    roleLabel: 'Agroecólogo Urbano',
    avatarIcon: '👨‍🌾',
    hydration: 80,
    health: 92,
    hasPff2Mask: false,
    statusText: 'Regando mudas de Ipê e Baru',
    isSheltered: false,
    homeId: 'house_joao',
    position: { x: 26, z: -2 },
    targetPosition: { x: 36, z: 2 },
    color: '#84cc16',
    bio: 'Especialista em espécies nativas do Cerrado. Mantém o viveiro comunitário e defende a cobertura vegetal como ar-condicionado natural.',
    vulnerabilityNote: 'Dedica-se a nutrir árvores para aumentar a umidade relativa do ar.',
  },
  {
    id: 'cit_ana',
    name: 'Dra. Ana',
    age: 34,
    role: 'nurse_pse',
    roleLabel: 'Enfermeira do PSE / UBS',
    avatarIcon: '👩‍⚕️',
    hydration: 92,
    health: 98,
    hasPff2Mask: true,
    statusText: 'Triagem comunitária de saúde',
    isSheltered: false,
    homeId: 'ubs_clinic',
    position: { x: 22, z: 12 },
    targetPosition: { x: 12, z: -10 },
    color: '#10b981',
    bio: 'Profissional dedicada do Programa Saúde na Escola e do Polo Respiratório da UBS. Carrega kits de inalação e sais de reidratação oral.',
    vulnerabilityNote: 'Presta apoio clínico móvel para estabilizar cidadãos com baixa saúde.',
  },
];

const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'house_pedrinho',
    name: 'Casa do Pedrinho',
    type: 'colonial_house',
    position: { x: 18, z: -26 },
    baseTemp: 32,
    currentTemp: 32,
    treesPlanted: 0,
    hasCisternConnection: false,
    residents: ['cit_pedrinho'],
    icon: '🏡',
    description: 'Residência familiar com telhado colonial terracota e quintal propício para plantio de Ipês.',
  },
  {
    id: 'house_maria',
    name: 'Residência Dona Maria',
    type: 'colonial_house',
    position: { x: 24, z: -26 },
    baseTemp: 33,
    currentTemp: 33,
    treesPlanted: 0,
    hasCisternConnection: false,
    residents: ['cit_maria'],
    icon: '🏡',
    description: 'Casa colonial tradicional. Telhado recebe incidência solar direta.',
  },
  {
    id: 'house_beatriz',
    name: 'Casa da Beatriz (Acessível)',
    type: 'colonial_house',
    position: { x: 18, z: -4 },
    baseTemp: 31,
    currentTemp: 31,
    treesPlanted: 0,
    hasCisternConnection: true,
    residents: ['cit_beatriz'],
    icon: '🏠',
    description: 'Imóvel com rampas adaptadas e conexão de água comunitária.',
  },
  {
    id: 'house_joao',
    name: 'Horta & Casa do Seu João',
    type: 'colonial_house',
    position: { x: 24, z: -4 },
    baseTemp: 29,
    currentTemp: 29,
    treesPlanted: 1,
    hasCisternConnection: true,
    residents: ['cit_joao'],
    icon: '🌱',
    description: 'Propriedade agroecológica com microclima ameno e compostagem.',
  },
  {
    id: 'school_pse',
    name: 'Escola Pública / PSE',
    type: 'school_pse',
    position: { x: 18, z: 8 },
    baseTemp: 30,
    currentTemp: 30,
    treesPlanted: 2,
    hasCisternConnection: true,
    residents: ['cit_pedrinho', 'cit_beatriz'],
    icon: '🏫',
    description: 'Polo educativo com quadra, pátio e programas de educação ambiental e climática.',
  },
  {
    id: 'ubs_clinic',
    name: 'UBS & Polo Respiratório',
    type: 'ubs_clinic',
    position: { x: 26, z: 8 },
    baseTemp: 26,
    currentTemp: 26,
    treesPlanted: 1,
    hasCisternConnection: true,
    residents: ['cit_ana'],
    icon: '🏥',
    description: 'Centro de saúde equipado para nebulização, oxigenoterapia e estabilização de choque térmico.',
  },
  {
    id: 'brigade_station',
    name: 'Base de Brigadistas de Incêndio',
    type: 'brigade_station',
    position: { x: 20, z: 30 },
    baseTemp: 29,
    currentTemp: 29,
    treesPlanted: 0,
    hasCisternConnection: true,
    residents: ['cit_lucas'],
    icon: '🚒',
    description: 'Posto de comando tático com caminhão de contenção, mangueiras e torre de observação.',
  },
  {
    id: 'cistern_meia_ponte',
    name: 'Cisterna Comunitária do Rio Meia Ponte',
    type: 'cistern',
    position: { x: -2, z: 3 },
    baseTemp: 24,
    currentTemp: 24,
    treesPlanted: 1,
    hasCisternConnection: true,
    residents: [],
    icon: '💧',
    description: 'Grande reservatório de água filtrada captada do Rio Meia Ponte com fonte pública de hidratação.',
  },
];

const INITIAL_HEROES: HeroMember[] = [
  {
    id: 'hero_commander',
    name: 'Larissa',
    friendRole: 'Climatologista Chefe',
    avatar: '👩‍🔬',
    skillName: 'Semeadura de Nuvens',
    skillDesc: 'Induz precipitação leve que reduz a temperatura em 5°C e dispersa partículas de fuligem MP2.5.',
    cooldownSec: 35,
    currentCooldown: 0,
    bioCreditCost: 60,
    icon: '🌧️',
  },
  {
    id: 'hero_carlos',
    name: 'Carlos',
    friendRole: 'Engenheiro Hídrico',
    avatar: '👨‍🔧',
    skillName: 'Diques e Contenção Meia Ponte',
    skillDesc: 'Ergue barreiras temporárias e bombeia águas fluviais de volta para reservatórios seguros.',
    cooldownSec: 40,
    currentCooldown: 0,
    bioCreditCost: 55,
    icon: '🛡️',
  },
  {
    id: 'hero_marina',
    name: 'Marina',
    friendRole: 'Socorrista PSE',
    avatar: '👩‍⚕️',
    skillName: 'Hidratação Comunitária Geral',
    skillDesc: 'Distribui sais orais e água fresca instantaneamente restaurando +40% de hidratação de todos os moradores.',
    cooldownSec: 30,
    currentCooldown: 0,
    bioCreditCost: 50,
    icon: '💧',
  },
  {
    id: 'hero_thiago',
    name: 'Thiago',
    friendRole: 'Mestre Brigadista',
    avatar: '👨‍🚒',
    skillName: 'Cortina de Abafadores Táticos',
    skillDesc: 'Coordena brigadistas para conter focos de fogo e resfriar áreas com risco iminente de queimada.',
    cooldownSec: 35,
    currentCooldown: 0,
    bioCreditCost: 65,
    icon: '🔥',
  },
];

const INITIAL_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'item_mask_pff2',
    name: 'Máscara Facial PFF2 / N95',
    category: 'protection',
    icon: '😷',
    basePrice: 20,
    currentPrice: 20,
    playerInventory: 3,
    stock: 24,
    demandFactor: 1.0,
    description: 'Filtração mecânica de alta eficiência contra partículas finas MP2.5 geradas por queimadas.',
    benefit: 'Garante +30% de saúde pulmonar imediata e imunidade contra fuligem.',
  },
  {
    id: 'item_cold_water',
    name: 'Galão de Água Gelada (5L)',
    category: 'hydration',
    icon: '💧',
    basePrice: 12,
    currentPrice: 12,
    playerInventory: 5,
    stock: 40,
    demandFactor: 1.0,
    description: 'Água pura e resfriada proveniente da cisterna do Rio Meia Ponte.',
    benefit: 'Restaura +35% de hidratação e previne síncope por estresse térmico.',
  },
  {
    id: 'item_ipe_seedling',
    name: 'Muda de Ipê Amarelo Nativo',
    category: 'ecological',
    icon: '🌱',
    basePrice: 35,
    currentPrice: 35,
    playerInventory: 2,
    stock: 18,
    demandFactor: 1.0,
    description: 'Espécie emblemática do Cerrado. Suas raízes profundas e copa densa geram sombra e microclima ameno.',
    benefit: 'Reduz a temperatura local da residência em até 3°C por evapotranspiração permanente.',
  },
  {
    id: 'item_bti_larvicide',
    name: 'Bio-Larvicida BTI Ecológico',
    category: 'protection',
    icon: '🦟',
    basePrice: 25,
    currentPrice: 25,
    playerInventory: 1,
    stock: 15,
    demandFactor: 1.0,
    description: 'Bacillus thuringiensis israelensis que elimina larvas de Aedes sem contaminar a água ou fauna.',
    benefit: 'Neutraliza criadouros de mosquitos após chuvas intensas.',
  },
  {
    id: 'item_air_sensor',
    name: 'Microestação de Monitoramento MP2.5',
    category: 'emergency',
    icon: '📡',
    basePrice: 50,
    currentPrice: 50,
    playerInventory: 1,
    stock: 8,
    demandFactor: 1.0,
    description: 'Sensor óptico conectado à Defesa Civil que antecipa alertas meteorológicos.',
    benefit: 'Aumenta em 20% os Bio-Créditos recebidos por mitigações bem-sucedidas.',
  },
];

const INITIAL_CLAN: Clan = {
  id: 'clan_cerrado_vivo',
  name: 'Sentinelas do Cerrado',
  tag: 'CERRADO',
  motto: 'Resiliência, Preservação e Solidariedade Climática',
  leaderName: 'Larissa',
  myRole: 'Líder',
  level: 4,
  weeklyScore: 14250,
  members: [
    { id: 'm1', name: 'Larissa (Você)', role: 'Líder', score: 4850, treesPlanted: 18, avatar: '👩‍🔬', isOnline: true },
    { id: 'm2', name: 'Carlos', role: 'Oficial', score: 3400, treesPlanted: 12, avatar: '👨‍🔧', isOnline: true },
    { id: 'm3', name: 'Marina', role: 'Oficial', score: 3100, treesPlanted: 14, avatar: '👩‍⚕️', isOnline: true },
    { id: 'm4', name: 'Thiago', role: 'Membro', score: 2900, treesPlanted: 9, avatar: '👨‍🚒', isOnline: false },
    { id: 'm5', name: 'Beatriz_Gyn', role: 'Membro', score: 1800, treesPlanted: 7, avatar: '🌿', isOnline: true },
  ],
  weeklyWarGoal: {
    title: 'Guerra Semanal: Florestamento Urbano e Resfriamento',
    description: 'Plante 40 Ipês Amarelos e hidrate 100 moradores vulneráveis para vencer a guilda rival!',
    current: 28,
    target: 40,
    rewardBioCredits: 500,
  },
  rivalClanName: 'EcoDefensores Meia Ponte',
  rivalScore: 13800,
};

const INITIAL_TRADES: ClanTrade[] = [
  {
    id: 'trade_1',
    sellerName: 'Carlos',
    sellerClan: 'CERRADO',
    itemName: 'Muda de Ipê Amarelo Nativo',
    itemIcon: '🌱',
    quantity: 2,
    price: 30,
    timestamp: 'Há 12 min',
    isMyTrade: false,
  },
  {
    id: 'trade_2',
    sellerName: 'Marina',
    sellerClan: 'CERRADO',
    itemName: 'Máscara Facial PFF2 / N95',
    itemIcon: '😷',
    quantity: 3,
    price: 18,
    timestamp: 'Há 25 min',
    isMyTrade: false,
  },
];

const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge_first_rescue',
    title: 'Primeiro Resgate Climático',
    category: 'Clima',
    description: 'Ofereça água gelada ou máscara PFF2 a um cidadão em estresse térmico.',
    icon: '🏅',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    rewardBioCredits: 50,
    unlockedDate: 'Conquistado!',
  },
  {
    id: 'badge_tree_master',
    title: 'Guardião dos Ipês Dourados',
    category: 'Ecologia',
    description: 'Plante 5 Ipês Amarelos em quintais residenciais do bairro.',
    icon: '🌳',
    unlocked: false,
    progress: 1,
    maxProgress: 5,
    rewardBioCredits: 120,
  },
  {
    id: 'badge_air_protector',
    title: 'Pulmão de Aço Comunitário',
    category: 'Comunidade',
    description: 'Mantenha Pedrinho e as crianças com máscara PFF2 durante um pico de queimada.',
    icon: '🛡️',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rewardBioCredits: 150,
  },
  {
    id: 'badge_clan_champion',
    title: 'Líder Supremo de Resiliência',
    category: 'Liderança',
    description: 'Vença um duelo semanal 1v1 contra a guilda rival de mitigação climática.',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardBioCredits: 250,
  },
];

const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    authorName: 'Larissa',
    authorRole: 'Comandante de Resiliência',
    clanTag: 'CERRADO',
    avatar: '👩‍🔬',
    timeAgo: 'Há 15 min',
    content: 'Acabamos de conter o avanço térmico na Rua das Sucupiras! Dona Maria e Pedrinho hidratados e seguros. A cisterna do Rio Meia Ponte operando com 98% de eficiência.',
    badgeAttachment: {
      title: 'Primeiro Resgate Climático',
      icon: '🏅',
    },
    likes: 14,
    liked: false,
  },
  {
    id: 'post_2',
    authorName: 'Carlos',
    authorRole: 'Oficial Engenheiro Hídrico',
    clanTag: 'CERRADO',
    avatar: '👨‍🔧',
    timeAgo: 'Há 40 min',
    content: 'Diques de contenção concluídos perto da Escola Pública PSE. Vazão do Meia Ponte estabilizada. Quem precisar de mudas de Ipê, acabei de colocar 2 no mercado do clã!',
    likes: 9,
    liked: true,
  },
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat_1',
    senderName: 'Defesa Civil 40199',
    clanTag: 'OFICIAL',
    channel: 'alert',
    text: 'ALERTA METEOROLÓGICO: Umidade relativa do ar em 11%. Risco crítico de desidratação e fogo.',
    time: '10:28',
  },
  {
    id: 'chat_2',
    senderName: 'Carlos',
    clanTag: 'CERRADO',
    channel: 'clan',
    text: 'Atenção clã! Ativando as comportas secundárias para resfriar a avenida principal.',
    time: '10:29',
  },
  {
    id: 'chat_3',
    senderName: 'Mariana_DF',
    clanTag: 'BRASÍLIA',
    channel: 'global',
    text: 'Guardiões 3D está salvando vidas no Planalto Central! Parabéns ao Clã Cerrado pelo top 1!',
    time: '10:30',
  },
];

interface GameContextType {
  // Weather
  currentWeather: WeatherEvent;
  switchWeatherScenario: (type: WeatherEventType) => void;

  // Citizens & Selection
  citizens: Citizen[];
  selectedCitizen: Citizen | null;
  selectCitizenById: (id: string | null) => void;
  offerColdWater: (citizenId: string) => void;
  equipPff2Mask: (citizenId: string) => void;
  sendToClinicUbs: (citizenId: string) => void;

  // Buildings & Planting
  buildings: Building[];
  selectedBuilding: Building | null;
  selectBuildingById: (id: string | null) => void;
  plantIpeInBuilding: (buildingId: string) => void;

  // Heroes & Customization
  heroes: HeroMember[];
  updateHeroName: (heroId: string, newName: string) => void;
  triggerHeroSkill: (heroId: string) => void;

  // Economy & Market
  commanderProfile: CommanderProfile;
  updateCommanderProfile: (updates: Partial<CommanderProfile>) => void;
  marketItems: MarketItem[];
  buyMarketItem: (itemId: string) => void;
  clanTrades: ClanTrade[];
  createClanTradeOffer: (itemName: string, quantity: number, price: number) => void;
  buyClanTrade: (tradeId: string) => void;

  // Clan & Hierarchy
  clan: Clan;
  updateClanInfo: (name: string, motto: string, tag: string) => void;
  sendClanSos: () => void;
  conductLeaderDuel1v1: () => void;

  // Achievements, Feed & Social
  badges: AchievementBadge[];
  socialPosts: SocialPost[];
  toggleLikeSocialPost: (postId: string) => void;
  createSocialPost: (content: string, badgeId?: string) => void;
  challengeFriendModalOpen: boolean;
  setChallengeFriendModalOpen: (open: boolean) => void;
  shareBadgeOnFeed: (badgeId: string) => void;

  // Chat Internal
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, channel: 'global' | 'clan') => void;

  // Weekly Report
  weeklyReport: WeeklyPerformanceReport;

  // Game UI State
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  cameraPreset: 'overview' | 'residential' | 'community' | 'park' | 'river';
  setCameraPreset: (preset: 'overview' | 'residential' | 'community' | 'park' | 'river') => void;

  // Planted trees count
  totalTreesPlanted: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Weather
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherEvent>(
    WEATHER_SCENARIOS[0]
  );

  // Entities
  const [citizens, setCitizens] = useState<Citizen[]>(INITIAL_CITIZENS);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Heroes
  const [heroes, setHeroes] = useState<HeroMember[]>(INITIAL_HEROES);

  // Economy & Profile
  const [commanderProfile, setCommanderProfile] = useState<CommanderProfile>({
    commanderName: 'Larissa',
    title: 'Comandante de Resiliência do Cerrado',
    avatar: '👩‍🔬',
    motto: 'Proteger vidas e restaurar a biosfera a cada decisão.',
    level: 5,
    xp: 2450,
    nextLevelXp: 3000,
    bioCredits: 380,
    totalScore: 12450,
    lgpdAccepted: true,
  });

  // Market & Trades
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);
  const [clanTrades, setClanTrades] = useState<ClanTrade[]>(INITIAL_TRADES);

  // Clan
  const [clan, setClan] = useState<Clan>(INITIAL_CLAN);

  // Badges & Feed
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [challengeFriendModalOpen, setChallengeFriendModalOpen] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // UI state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(sound.getMuted());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<
    'overview' | 'residential' | 'community' | 'park' | 'river'
  >('overview');

  const [totalTreesPlanted, setTotalTreesPlanted] = useState<number>(5);

  // Weekly Report
  const [weeklyReport] = useState<WeeklyPerformanceReport>({
    weekId: 'SEM-44-2026',
    period: '25 a 31 de Outubro',
    livesSaved: 142,
    ipeTreesPlanted: 18,
    avgTempReductionCelsius: 2.8,
    mp25ParticlesFilteredKg: 46.5,
    floodWaterManagedLiters: 120000,
    bioCreditsGenerated: 3450,
    nationalRank: 3,
    statusGrade: 'A+',
    officialSecretariatNotice:
      'Boletim da Secretaria Municipal de Meio Ambiente e Defesa Civil: Operação Cerrado Seguro atingiu grau de excelência. Ação preventiva contra MP2.5 e preservação de mudas no leito do Meia Ponte foram fundamentais.',
  });

  // Selected entities
  const selectedCitizen =
    citizens.find((c) => c.id === selectedCitizenId) || null;
  const selectedBuilding =
    buildings.find((b) => b.id === selectedBuildingId) || null;

  // Toggle Mute
  const toggleAudioMute = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
  };

  // Switch weather scenario
  const switchWeatherScenario = (type: WeatherEventType) => {
    const found = WEATHER_SCENARIOS.find((w) => w.type === type);
    if (found) {
      setCurrentWeather({ ...found });
      sound.playAlertSiren();
    }
  };

  // Select citizen
  const selectCitizenById = (id: string | null) => {
    setSelectedCitizenId(id);
    setSelectedBuildingId(null);
    if (id) {
      sound.playClick();
      setActiveModal('citizen_inspector');
    }
  };

  // Select building
  const selectBuildingById = (id: string | null) => {
    setSelectedBuildingId(id);
    setSelectedCitizenId(null);
    if (id) {
      sound.playClick();
      setActiveModal('building_inspector');
    }
  };

  // Action: Offer cold water
  const offerColdWater = (citizenId: string) => {
    const cost = 12;
    if (commanderProfile.bioCredits < cost) {
      alert('Bio-Créditos insuficientes! Salve mais eventos para ganhar créditos.');
      return;
    }

    sound.playWaterSplash();
    setCitizens((prev) =>
      prev.map((c) => {
        if (c.id === citizenId) {
          const newHydration = Math.min(100, c.hydration + 40);
          return {
            ...c,
            hydration: newHydration,
            statusText: 'Hidratado e refrescado pela Cisterna do Meia Ponte',
          };
        }
        return c;
      })
    );

    setCommanderProfile((prev) => ({
      ...prev,
      bioCredits: prev.bioCredits - cost + 25, // Net reward for saving citizen!
      xp: prev.xp + 45,
      totalScore: prev.totalScore + 100,
    }));

    sound.playCoinSound();
  };

  // Action: Equip PFF2 Mask
  const equipPff2Mask = (citizenId: string) => {
    const cost = 20;
    if (commanderProfile.bioCredits < cost) {
      alert('Bio-Créditos insuficientes para máscara PFF2!');
      return;
    }

    sound.playMaskEquip();
    setCitizens((prev) =>
      prev.map((c) => {
        if (c.id === citizenId) {
          return {
            ...c,
            hasPff2Mask: true,
            health: Math.min(100, c.health + 30),
            statusText: 'Protegido com máscara PFF2 contra MP2.5',
          };
        }
        return c;
      })
    );

    setCommanderProfile((prev) => ({
      ...prev,
      bioCredits: prev.bioCredits - cost + 30,
      xp: prev.xp + 60,
      totalScore: prev.totalScore + 150,
    }));

    sound.playCoinSound();
  };

  // Action: Send to Clinic UBS
  const sendToClinicUbs = (citizenId: string) => {
    sound.playClick();
    setCitizens((prev) =>
      prev.map((c) => {
        if (c.id === citizenId) {
          return {
            ...c,
            health: 100,
            hydration: 95,
            isSheltered: true,
            statusText: 'Recebendo suporte de oxigênio no Polo Respiratório da UBS',
          };
        }
        return c;
      })
    );

    setCommanderProfile((prev) => ({
      ...prev,
      xp: prev.xp + 80,
      totalScore: prev.totalScore + 200,
    }));
  };

  // Action: Plant Ipê tree in house garden
  const plantIpeInBuilding = (buildingId: string) => {
    const cost = 35;
    if (commanderProfile.bioCredits < cost) {
      alert('Bio-Créditos insuficientes para adquirir a muda de Ipê!');
      return;
    }

    sound.playPlantTree();
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id === buildingId) {
          return {
            ...b,
            treesPlanted: b.treesPlanted + 1,
            currentTemp: Math.max(24, b.currentTemp - 3),
          };
        }
        return b;
      })
    );

    setTotalTreesPlanted((p) => p + 1);

    // Update clan weekly war goal
    setClan((prev) => ({
      ...prev,
      weeklyScore: prev.weeklyScore + 300,
      weeklyWarGoal: {
        ...prev.weeklyWarGoal,
        current: Math.min(prev.weeklyWarGoal.target, prev.weeklyWarGoal.current + 1),
      },
    }));

    setCommanderProfile((prev) => ({
      ...prev,
      bioCredits: prev.bioCredits - cost + 45,
      xp: prev.xp + 90,
      totalScore: prev.totalScore + 250,
    }));

    // Unlock badge progress
    setBadges((prev) =>
      prev.map((badge) => {
        if (badge.id === 'badge_tree_master') {
          const nextProg = badge.progress + 1;
          const isDone = nextProg >= badge.maxProgress;
          return {
            ...badge,
            progress: nextProg,
            unlocked: isDone,
            unlockedDate: isDone ? 'Hoje!' : undefined,
          };
        }
        return badge;
      })
    );
  };

  // Hero name customization
  const updateHeroName = (heroId: string, newName: string) => {
    setHeroes((prev) =>
      prev.map((h) => (h.id === heroId ? { ...h, name: newName } : h))
    );
  };

  // Hero Skill trigger
  const triggerHeroSkill = (heroId: string) => {
    const hero = heroes.find((h) => h.id === heroId);
    if (!hero || hero.currentCooldown > 0) return;

    if (commanderProfile.bioCredits < hero.bioCreditCost) {
      alert(`Bio-Créditos insuficientes para ativar ${hero.skillName}!`);
      return;
    }

    if (heroId === 'hero_commander') {
      // Semeadura de nuvens
      sound.playRainBreeze();
      setCurrentWeather((prev) => ({
        ...prev,
        temperature: Math.max(24, prev.temperature - 5.5),
        mp25: Math.max(15, prev.mp25 - 90),
        humidity: Math.min(85, prev.humidity + 35),
      }));
    } else if (heroId === 'hero_marina') {
      // Hidratação comunitária
      sound.playWaterSplash();
      setCitizens((prev) =>
        prev.map((c) => ({
          ...c,
          hydration: Math.min(100, c.hydration + 40),
          statusText: 'Refrescado pelo mutirão de hidratação de Marina!',
        }))
      );
    } else if (heroId === 'hero_carlos') {
      // Diques Meia Ponte
      sound.playClick();
      setCurrentWeather((prev) => ({
        ...prev,
        riverLevel: 2.2,
      }));
    } else if (heroId === 'hero_thiago') {
      // Brigada de contenção
      sound.playClick();
      setCurrentWeather((prev) => ({
        ...prev,
        mp25: 25,
      }));
    }

    // Spend credits & apply cooldown
    setCommanderProfile((p) => ({
      ...p,
      bioCredits: p.bioCredits - hero.bioCreditCost + 80,
      xp: p.xp + 100,
      totalScore: p.totalScore + 300,
    }));

    setHeroes((prev) =>
      prev.map((h) =>
        h.id === heroId ? { ...h, currentCooldown: h.cooldownSec } : h
      )
    );

    sound.playVictory();
  };

  // Market: Buy item
  const buyMarketItem = (itemId: string) => {
    const item = marketItems.find((i) => i.id === itemId);
    if (!item) return;

    if (commanderProfile.bioCredits < item.currentPrice) {
      alert('Bio-Créditos insuficientes!');
      return;
    }

    sound.playCoinSound();
    setMarketItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              stock: Math.max(0, i.stock - 1),
              playerInventory: i.playerInventory + 1,
            }
          : i
      )
    );

    setCommanderProfile((prev) => ({
      ...prev,
      bioCredits: prev.bioCredits - item.currentPrice,
    }));
  };

  // Trade offer creation
  const createClanTradeOffer = (
    itemName: string,
    quantity: number,
    price: number
  ) => {
    const newTrade: ClanTrade = {
      id: `trade_${Date.now()}`,
      sellerName: commanderProfile.commanderName,
      sellerClan: clan.tag,
      itemName,
      itemIcon: itemName.includes('Ipê') ? '🌱' : '😷',
      quantity,
      price,
      timestamp: 'Agora mesmo',
      isMyTrade: true,
    };
    setClanTrades((prev) => [newTrade, ...prev]);
    sound.playClick();
  };

  // Trade offer buy
  const buyClanTrade = (tradeId: string) => {
    const trade = clanTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    if (commanderProfile.bioCredits < trade.price) {
      alert('Bio-Créditos insuficientes para comprar este lote de troca!');
      return;
    }

    sound.playCoinSound();
    setClanTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setCommanderProfile((prev) => ({
      ...prev,
      bioCredits: prev.bioCredits - trade.price,
    }));
  };

  // Clan Info update
  const updateClanInfo = (name: string, motto: string, tag: string) => {
    setClan((prev) => ({
      ...prev,
      name,
      motto,
      tag: tag.toUpperCase().slice(0, 8),
    }));
  };

  // Send SOS
  const sendClanSos = () => {
    sound.playAlertSiren();
    const sosMsg: ChatMessage = {
      id: `sos_${Date.now()}`,
      senderName: `${commanderProfile.commanderName} [SOS]`,
      clanTag: clan.tag,
      channel: 'clan',
      text: `🚨 SOS CLIMÁTICO! Setor Sul enfrentando pico de ${currentWeather.title}! Precisamos de reforço imediato de água e brigadistas!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSos: true,
    };
    setChatMessages((prev) => [sosMsg, ...prev]);
  };

  // Conduct 1v1 leader duel
  const conductLeaderDuel1v1 = () => {
    sound.playVictory();
    const winPoints = 450;
    setClan((prev) => ({
      ...prev,
      weeklyScore: prev.weeklyScore + winPoints,
    }));
    setCommanderProfile((p) => ({
      ...p,
      bioCredits: p.bioCredits + 150,
      xp: p.xp + 200,
      totalScore: p.totalScore + 500,
    }));

    // Unlock leader badge
    setBadges((prev) =>
      prev.map((b) =>
        b.id === 'badge_clan_champion'
          ? { ...b, unlocked: true, progress: 1, unlockedDate: 'Conquistado no Duelo!' }
          : b
      )
    );

    const post: SocialPost = {
      id: `post_${Date.now()}`,
      authorName: commanderProfile.commanderName,
      authorRole: 'Líder de Clã',
      clanTag: clan.tag,
      avatar: commanderProfile.avatar,
      timeAgo: 'Agora',
      content: `Venci o Duelo de Mitigação 1v1 contra o Líder de ${clan.rivalClanName}! Neutralizamos uma tempestade de areia e salvamos 20 moradores em tempo recorde!`,
      badgeAttachment: {
        title: 'Líder Supremo de Resiliência',
        icon: '👑',
      },
      likes: 21,
      liked: false,
    };
    setSocialPosts((p) => [post, ...p]);
  };

  // Social feed like
  const toggleLikeSocialPost = (postId: string) => {
    sound.playClick();
    setSocialPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      )
    );
  };

  // Create social post
  const createSocialPost = (content: string, badgeId?: string) => {
    sound.playClick();
    const badge = badges.find((b) => b.id === badgeId);
    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      authorName: commanderProfile.commanderName,
      authorRole: commanderProfile.title,
      clanTag: clan.tag,
      avatar: commanderProfile.avatar,
      timeAgo: 'Agora',
      content,
      badgeAttachment: badge
        ? { title: badge.title, icon: badge.icon }
        : undefined,
      likes: 1,
      liked: true,
    };
    setSocialPosts((prev) => [newPost, ...prev]);
  };

  // Share badge on feed
  const shareBadgeOnFeed = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    if (!badge) return;
    createSocialPost(
      `Conquistei a medalha [${badge.title}] em Guardiões 3D! Resiliência climática comunitária em ação pelo Cerrado.`,
      badgeId
    );
    alert('Medalha compartilhada com sucesso no feed social do jogo!');
  };

  // Send Chat message
  const sendChatMessage = (text: string, channel: 'global' | 'clan') => {
    if (!text.trim()) return;
    sound.playClick();
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      senderName: commanderProfile.commanderName,
      clanTag: clan.tag,
      channel,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [newMsg, ...prev]);
  };

  // Profile update
  const updateCommanderProfile = (updates: Partial<CommanderProfile>) => {
    setCommanderProfile((prev) => ({ ...prev, ...updates }));
  };

  /* -------------------------------------------------------------
   * REAL-TIME GAME LOOP & METEOROLOGY TICK
   * ----------------------------------------------------------- */
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // 1. Tick Hero Cooldowns
      setHeroes((prev) =>
        prev.map((h) => ({
          ...h,
          currentCooldown: Math.max(0, h.currentCooldown - 1),
        }))
      );

      // 2. Weather Duration countdown
      setCurrentWeather((prev) => {
        if (prev.remainingSec <= 1) {
          // Switch to next scenario automatically
          const nextIdx = (scenarioIndex + 1) % WEATHER_SCENARIOS.length;
          setScenarioIndex(nextIdx);
          const nextWeather = WEATHER_SCENARIOS[nextIdx];
          sound.playAlertSiren();
          return { ...nextWeather };
        }
        return { ...prev, remainingSec: prev.remainingSec - 1 };
      });

      // 3. Citizens physiological response to active weather
      setCitizens((prev) =>
        prev.map((c) => {
          let hydrationDelta = 0;
          let healthDelta = 0;

          // Heatwave: dehydrate
          if (currentWeather.temperature > 37) {
            hydrationDelta -= c.role === 'elderly' ? 2.5 : 1.2;
          }

          // Wildfire & MP2.5: health drop without PFF2
          if (currentWeather.mp25 > 100) {
            if (!c.hasPff2Mask) {
              healthDelta -= c.role === 'child_asthma' ? 3.5 : 1.5;
            }
          }

          // Flood: mobility and health drop if low-lying
          if (currentWeather.type === 'flood' && c.role === 'wheelchair_student') {
            healthDelta -= 1.0;
          }

          const newHydration = Math.max(0, Math.min(100, c.hydration + hydrationDelta));
          const newHealth = Math.max(0, Math.min(100, c.health + healthDelta));

          // Sims random walking path simulation
          const moveStep = (Math.random() - 0.5) * 1.5;
          const targetX = c.position.x + (Math.random() > 0.5 ? moveStep : 0);
          const targetZ = c.position.z + (Math.random() > 0.5 ? moveStep : 0);

          return {
            ...c,
            hydration: Math.round(newHydration),
            health: Math.round(newHealth),
            position: {
              x: Math.max(-2, Math.min(32, targetX)),
              z: Math.max(-26, Math.min(30, targetZ)),
            },
          };
        })
      );

      // 4. Dynamic Market Price fluctuation based on climate supply/demand
      setMarketItems((prev) =>
        prev.map((item) => {
          let demand = 1.0;
          if (currentWeather.type === 'wildfire' && item.id === 'item_mask_pff2') {
            demand = 1.6;
          } else if (currentWeather.type === 'heatwave' && item.id === 'item_cold_water') {
            demand = 1.5;
          } else if (currentWeather.type === 'dengue_outbreak' && item.id === 'item_bti_larvicide') {
            demand = 1.8;
          } else if (currentWeather.type === 'clear' && item.id === 'item_ipe_seedling') {
            demand = 0.8; // discounted during peace!
          }
          const price = Math.round(item.basePrice * demand);
          return {
            ...item,
            demandFactor: demand,
            currentPrice: price,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, currentWeather, scenarioIndex]);

  return (
    <GameContext.Provider
      value={{
        currentWeather,
        switchWeatherScenario,
        citizens,
        selectedCitizen,
        selectCitizenById,
        offerColdWater,
        equipPff2Mask,
        sendToClinicUbs,
        buildings,
        selectedBuilding,
        selectBuildingById,
        plantIpeInBuilding,
        heroes,
        updateHeroName,
        triggerHeroSkill,
        commanderProfile,
        updateCommanderProfile,
        marketItems,
        buyMarketItem,
        clanTrades,
        createClanTradeOffer,
        buyClanTrade,
        clan,
        updateClanInfo,
        sendClanSos,
        conductLeaderDuel1v1,
        badges,
        socialPosts,
        toggleLikeSocialPost,
        createSocialPost,
        challengeFriendModalOpen,
        setChallengeFriendModalOpen,
        shareBadgeOnFeed,
        chatMessages,
        sendChatMessage,
        weeklyReport,
        isPaused,
        setIsPaused,
        isAudioMuted,
        toggleAudioMute,
        activeModal,
        setActiveModal,
        cameraPreset,
        setCameraPreset,
        totalTreesPlanted,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
