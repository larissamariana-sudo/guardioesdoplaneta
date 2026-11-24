/**
 * Core Type Definitions for Guardiões 3D
 */

export type WeatherEventType =
  | 'clear'
  | 'heatwave'
  | 'wildfire'
  | 'flood'
  | 'dengue_outbreak'
  | 'dust_storm';

export interface WeatherEvent {
  type: WeatherEventType;
  title: string;
  tagline: string;
  temperature: number; // °C
  mp25: number; // µg/m³
  humidity: number; // %
  riverLevel: number; // meters (normal: 2.2m)
  severity: 1 | 2 | 3;
  durationSec: number;
  remainingSec: number;
  defenseAlertCode: string; // e.g. "40199"
  scientificContext: string;
  recommendedActions: string[];
}

export type CitizenRole =
  | 'child_asthma' // Pedrinho
  | 'elderly' // Dona Maria
  | 'brigadist' // Lucas Mendes
  | 'wheelchair_student' // Beatriz
  | 'agroecologist' // Seu João
  | 'nurse_pse'; // Dra. Ana

export interface Citizen {
  id: string;
  name: string;
  age: number;
  role: CitizenRole;
  roleLabel: string;
  avatarIcon: string;
  hydration: number; // 0 - 100
  health: number; // 0 - 100
  hasPff2Mask: boolean;
  statusText: string;
  isSheltered: boolean;
  homeId: string;
  position: { x: number; z: number };
  targetPosition: { x: number; z: number };
  color: string;
  bio: string;
  vulnerabilityNote: string;
}

export type BuildingType =
  | 'colonial_house'
  | 'school_pse'
  | 'ubs_clinic'
  | 'brigade_station'
  | 'cistern'
  | 'cerrado_park';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  position: { x: number; z: number };
  baseTemp: number; // e.g. 32
  currentTemp: number;
  treesPlanted: number;
  hasCisternConnection: boolean;
  residents: string[]; // Citizen ids
  icon: string;
  description: string;
}

export interface HeroMember {
  id: string;
  name: string;
  friendRole: string; // e.g. "Climatologista", "Socorrista PSE", "Eng. Hídrico", "Brigadista Chefe"
  avatar: string;
  skillName: string;
  skillDesc: string;
  cooldownSec: number;
  currentCooldown: number;
  bioCreditCost: number;
  icon: string;
}

export interface MarketItem {
  id: string;
  name: string;
  category: 'protection' | 'hydration' | 'ecological' | 'emergency';
  icon: string;
  basePrice: number;
  currentPrice: number;
  playerInventory: number;
  stock: number;
  demandFactor: number; // multiplier based on weather
  description: string;
  benefit: string;
}

export interface ClanMember {
  id: string;
  name: string;
  role: 'Líder' | 'Oficial' | 'Membro' | 'Recruta';
  score: number;
  treesPlanted: number;
  avatar: string;
  isOnline: boolean;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  motto: string;
  leaderName: string;
  myRole: 'Líder' | 'Oficial' | 'Membro';
  level: number;
  weeklyScore: number;
  members: ClanMember[];
  weeklyWarGoal: {
    title: string;
    description: string;
    current: number;
    target: number;
    rewardBioCredits: number;
  };
  rivalClanName: string;
  rivalScore: number;
}

export interface ClanTrade {
  id: string;
  sellerName: string;
  sellerClan: string;
  itemName: string;
  itemIcon: string;
  quantity: number;
  price: number;
  timestamp: string;
  isMyTrade: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'Clima' | 'Comunidade' | 'Ecologia' | 'Liderança';
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardBioCredits: number;
  unlockedDate?: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorRole: string;
  clanTag: string;
  avatar: string;
  timeAgo: string;
  content: string;
  badgeAttachment?: {
    title: string;
    icon: string;
  };
  likes: number;
  liked: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  clanTag: string;
  channel: 'global' | 'clan' | 'alert';
  text: string;
  time: string;
  isSos?: boolean;
}

export interface WeeklyPerformanceReport {
  weekId: string;
  period: string;
  livesSaved: number;
  ipeTreesPlanted: number;
  avgTempReductionCelsius: number;
  mp25ParticlesFilteredKg: number;
  floodWaterManagedLiters: number;
  bioCreditsGenerated: number;
  nationalRank: number;
  statusGrade: 'A+' | 'A' | 'B+' | 'B';
  officialSecretariatNotice: string;
}

export interface CommanderProfile {
  commanderName: string;
  title: string;
  avatar: string;
  motto: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  bioCredits: number;
  totalScore: number;
  lgpdAccepted: boolean;
}
