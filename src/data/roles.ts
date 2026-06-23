import { Role, RoleType, RecommendedConfig } from '../types';

// 导出RoleType
export type { RoleType } from '../types';

// 角色数据
export const ROLES: Record<RoleType, Role> = {
  werewolf: {
    type: 'werewolf',
    name: '狼人',
    camp: 'werewolf',
    description: '每晚可以杀死一名玩家',
    skill: '猎杀：每晚选择一名玩家将其杀死',
    actionOrder: 1,
    canActAtNight: true,
    canActAtDay: false,
    icon: '🐺'
  },
  wolfKing: {
    type: 'wolfKing',
    name: '狼王',
    camp: 'werewolf',
    description: '死亡时可以带走一名玩家',
    skill: '复仇：死亡时可以开枪带走一名玩家',
    actionOrder: 1,
    canActAtNight: true,
    canActAtDay: true,
    icon: '👑'
  },
  villager: {
    type: 'villager',
    name: '村民',
    camp: 'villager',
    description: '没有特殊技能的普通村民',
    skill: '无特殊技能，依靠推理和投票找出狼人',
    actionOrder: 0,
    canActAtNight: false,
    canActAtDay: false,
    icon: '👨‍🌾'
  },
  seer: {
    type: 'seer',
    name: '预言家',
    camp: 'villager',
    description: '每晚可以查验一名玩家的身份',
    skill: '查验：每晚选择一名玩家查验其是否为狼人',
    actionOrder: 2,
    canActAtNight: true,
    canActAtDay: false,
    icon: '🔮'
  },
  witch: {
    type: 'witch',
    name: '女巫',
    camp: 'villager',
    description: '拥有一瓶解药和一瓶毒药',
    skill: '解药：可以救活当晚被狼人杀死的玩家\n毒药：可以毒死一名玩家',
    actionOrder: 3,
    canActAtNight: true,
    canActAtDay: false,
    icon: '🧙‍♀️'
  },
  hunter: {
    type: 'hunter',
    name: '猎人',
    camp: 'villager',
    description: '死亡时可以开枪带走一名玩家',
    skill: '猎枪：死亡时可以开枪带走一名玩家',
    actionOrder: 0,
    canActAtNight: false,
    canActAtDay: true,
    icon: '🎯'
  },
  idiot: {
    type: 'idiot',
    name: '白痴',
    camp: 'villager',
    description: '被投票出局时可以翻牌免死',
    skill: '免死：被投票出局时可以翻牌免死，但之后失去投票权',
    actionOrder: 0,
    canActAtNight: false,
    canActAtDay: true,
    icon: '🤪'
  }
};

// 推荐配置
export const RECOMMENDED_CONFIGS: RecommendedConfig[] = [
  { playerCount: 4, werewolf: 1, villager: 2, seer: 1, witch: 0, hunter: 0, idiot: 0, wolfKing: 0 },
  { playerCount: 5, werewolf: 1, villager: 2, seer: 1, witch: 1, hunter: 0, idiot: 0, wolfKing: 0 },
  { playerCount: 6, werewolf: 2, villager: 2, seer: 1, witch: 1, hunter: 0, idiot: 0, wolfKing: 0 },
  { playerCount: 7, werewolf: 2, villager: 3, seer: 1, witch: 1, hunter: 0, idiot: 0, wolfKing: 0 },
  { playerCount: 8, werewolf: 2, villager: 3, seer: 1, witch: 1, hunter: 1, idiot: 0, wolfKing: 0 },
  { playerCount: 9, werewolf: 3, villager: 3, seer: 1, witch: 1, hunter: 1, idiot: 0, wolfKing: 0 },
  { playerCount: 10, werewolf: 3, villager: 3, seer: 1, witch: 1, hunter: 1, idiot: 1, wolfKing: 0 }
];

// 获取推荐配置
export function getRecommendedConfig(playerCount: number): RecommendedConfig {
  const config = RECOMMENDED_CONFIGS.find(c => c.playerCount === playerCount);
  if (config) return config;
  
  // 如果没有找到，生成默认配置
  const werewolfCount = Math.floor(playerCount / 3);
  const specialRoles = playerCount >= 5 ? 1 : 0; // 预言家
  const witchCount = playerCount >= 5 ? 1 : 0;
  const hunterCount = playerCount >= 8 ? 1 : 0;
  const idiotCount = playerCount >= 10 ? 1 : 0;
  
  const villagerCount = playerCount - werewolfCount - specialRoles - witchCount - hunterCount - idiotCount;
  
  return {
    playerCount,
    werewolf: werewolfCount,
    villager: villagerCount,
    seer: specialRoles,
    witch: witchCount,
    hunter: hunterCount,
    idiot: idiotCount,
    wolfKing: 0
  };
}

// 获取角色列表
export function getRoleList(config: Record<RoleType, number>): RoleType[] {
  const roles: RoleType[] = [];
  Object.entries(config).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      roles.push(role as RoleType);
    }
  });
  return roles;
}

// Fisher-Yates 洗牌算法
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 获取阵营图标
export function getCampIcon(camp: 'werewolf' | 'villager'): string {
  return camp === 'werewolf' ? '🐺' : '👥';
}

// 获取阵营名称
export function getCampName(camp: 'werewolf' | 'villager'): string {
  return camp === 'werewolf' ? '狼人阵营' : '好人阵营';
}