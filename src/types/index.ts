// 角色类型
export type RoleType = 'werewolf' | 'villager' | 'seer' | 'witch' | 'hunter' | 'idiot' | 'wolfKing';

// 阵营
export type Camp = 'werewolf' | 'villager';

// 游戏阶段
export type GamePhase = 'setup' | 'assign' | 'night' | 'day' | 'vote' | 'result';

// 夜晚阶段
export type NightPhase = 'werewolf' | 'seer' | 'witch' | 'hunter' | 'other';

// 玩家接口
export interface Player {
  id: string;
  name: string;
  role: RoleType;
  isAlive: boolean;
  hasUsedAbility: boolean;
  seatNumber: number;
}

// 角色配置
export interface RoleConfig {
  werewolf: number;
  villager: number;
  seer: number;
  witch: number;
  hunter: number;
  idiot: number;
  wolfKing: number;
}

// 夜晚行动
export interface NightAction {
  round: number;
  phase: NightPhase;
  actorId: string;
  actorRole: RoleType;
  targetId: string | null;
  actionType: 'kill' | 'check' | 'save' | 'poison' | 'shoot';
  result?: {
    success: boolean;
    message?: string;
  };
}

// 白天行动
export interface DayAction {
  round: number;
  actionType: 'speech' | 'vote';
  playerId?: string;
  votes?: { [voterId: string]: string }; // 投票人ID -> 被投票人ID
  eliminatedId?: string;
}

// 游戏日志
export interface GameLogEntry {
  id: string;
  round: number;
  phase: 'night' | 'day';
  timestamp: Date;
  eventType: 'death' | 'action' | 'vote' | 'result' | 'other';
  description: string;
  players?: string[];
}

// 游戏设置
export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  speechRate: number;
  antiPeekMode: boolean;
  timerEnabled: boolean;
  speechTime: number; // 发言时间（秒）
  actionTime: number; // 行动时间（秒）
}

// 游戏状态
export interface GameState {
  // 游戏配置
  playerCount: number;
  roleConfig: RoleConfig;
  
  // 玩家信息
  players: Player[];
  currentPlayerIndex: number;
  
  // 游戏进程
  phase: GamePhase;
  round: number;
  nightPhase: NightPhase | null;
  nightActions: NightAction[];
  dayActions: DayAction[];
  
  // 当前回合状态
  currentNightActions: NightAction[];
  currentVotes: { [voterId: string]: string };
  currentSpeakerIndex: number;
  
  // 游戏结果
  winner: Camp | null;
  gameLog: GameLogEntry[];
  
  // 死亡玩家
  deadTonight: string[];
  
  // 女巫状态
  witchHasAntidote: boolean;
  witchHasPoison: boolean;
  
  // 猎人状态
  hunterCanShoot: boolean;
  
  // 白痴状态
  idiotRevealed: boolean;
}

// 角色信息
export interface Role {
  type: RoleType;
  name: string;
  camp: Camp;
  description: string;
  skill: string;
  actionOrder: number;
  canActAtNight: boolean;
  canActAtDay: boolean;
  icon: string;
}

// 推荐配置
export interface RecommendedConfig {
  playerCount: number;
  werewolf: number;
  villager: number;
  seer: number;
  witch: number;
  hunter: number;
  idiot: number;
  wolfKing: number;
}