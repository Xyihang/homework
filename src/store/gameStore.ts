import { create } from 'zustand';
import { GameState, Player, RoleType, Camp, NightPhase, NightAction, GameLogEntry, GameSettings } from '../types';
import { getRoleList, shuffleArray, generateId, ROLES } from '../data/roles';
import { saveGameState } from '../utils/storage';

interface GameStore extends GameState {
  // 游戏设置
  settings: GameSettings;
  
  // 初始化游戏
  initGame: (playerCount: number, roleConfig: Record<RoleType, number>) => void;
  
  // 设置玩家
  setPlayers: (players: Player[]) => void;
  
  // 开始游戏
  startGame: () => void;
  
  // 夜晚阶段
  startNightPhase: () => void;
  setNightPhase: (phase: NightPhase) => void;
  executeNightAction: (action: NightAction) => void;
  endNightPhase: () => void;
  
  // 白天阶段
  startDayPhase: () => void;
  startSpeechPhase: () => void;
  nextSpeaker: () => void;
  startVotePhase: () => void;
  submitVote: (voterId: string, targetId: string) => void;
  endVotePhase: () => void;
  
  // 设备传递
  setCurrentPlayer: (index: number) => void;
  showRole: (playerId: string) => void;
  hideRole: () => void;
  
  // 游戏结束
  checkGameEnd: () => boolean;
  endGame: (winner: Camp) => void;
  
  // 日志
  addLog: (entry: GameLogEntry) => void;
  
  // 重置游戏
  resetGame: () => void;
  
  // 更新设置
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // 特殊技能
  useWitchAntidote: (targetId: string) => void;
  useWitchPoison: (targetId: string) => void;
  hunterShoot: (targetId: string) => void;
  idiotReveal: () => void;

  // 猎人开枪流程
  setHunterTarget: (targetId: string | null) => void;
  confirmHunterShoot: () => void;
  skipHunterShoot: () => void;
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  volume: 0.8,
  speechRate: 1,
  antiPeekMode: true,
  timerEnabled: true,
  speechTime: 60,
  actionTime: 30
};

const initialState: GameState = {
  playerCount: 0,
  roleConfig: {
    werewolf: 0,
    villager: 0,
    seer: 0,
    witch: 0,
    hunter: 0,
    idiot: 0,
    wolfKing: 0
  },
  players: [],
  currentPlayerIndex: 0,
  phase: 'setup',
  round: 0,
  nightPhase: null,
  nightActions: [],
  dayActions: [],
  currentNightActions: [],
  currentVotes: {},
  currentSpeakerIndex: 0,
  winner: null,
  gameLog: [],
  deadTonight: [],
  witchHasAntidote: true,
  witchHasPoison: true,
  hunterCanShoot: true,
  pendingHunterShoot: false,
  hunterTarget: null,
  idiotRevealed: false
};

// 自动保存游戏状态
const autoSave = (state: GameState) => {
  try {
    saveGameState(state);
  } catch (e) {
    console.error('自动保存失败', e);
  }
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  settings: defaultSettings,
  
  initGame: (playerCount, roleConfig) => {
    set({
      playerCount,
      roleConfig,
      phase: 'setup',
      players: [],
      currentPlayerIndex: 0,
      round: 0,
      nightActions: [],
      dayActions: [],
      winner: null,
      gameLog: [],
      deadTonight: [],
      witchHasAntidote: true,
      witchHasPoison: true,
      hunterCanShoot: true,
      pendingHunterShoot: false,
      hunterTarget: null,
      idiotRevealed: false
    });
    autoSave(get());
  },
  
  setPlayers: (players) => {
    set({ players, phase: 'assign' });
    autoSave(get());
  },
  
  startGame: () => {
    const state = get();
    set({
      phase: 'night',
      round: 1,
      currentPlayerIndex: 0,
      currentNightActions: [],
      currentVotes: {},
      currentSpeakerIndex: 0
    });

    get().addLog({
      id: generateId(),
      round: 1,
      phase: 'night',
      timestamp: new Date(),
      eventType: 'other',
      description: '游戏开始，第一夜'
    });
    autoSave(get());
  },
  
  startNightPhase: () => {
    const state = get();
    set({
      phase: 'night',
      nightPhase: 'werewolf',
      currentNightActions: [],
      deadTonight: []
    });
  },

  setNightPhase: (phase) => {
    set({ nightPhase: phase });
  },
  
  executeNightAction: (action) => {
    const state = get();
    const newActions = [...state.currentNightActions, action];
    set({ currentNightActions: newActions });
    
    // 处理狼人杀人
    if (action.actionType === 'kill' && action.targetId) {
      set({ deadTonight: [...state.deadTonight, action.targetId] });
    }
    
    // 处理女巫救人
    if (action.actionType === 'save' && action.targetId) {
      const newDeadTonight = state.deadTonight.filter(id => id !== action.targetId);
      set({ deadTonight: newDeadTonight, witchHasAntidote: false });
    }
    
    // 处理女巫毒人
    if (action.actionType === 'poison' && action.targetId) {
      set({ 
        deadTonight: [...state.deadTonight, action.targetId],
        witchHasPoison: false 
      });
    }
  },
  
  endNightPhase: () => {
    const state = get();
    
    // 处理死亡
    const deadPlayers = state.deadTonight;
    const newPlayers = state.players.map(p => 
      deadPlayers.includes(p.id) ? { ...p, isAlive: false } : p
    );
    
    // 记录死亡日志
    deadPlayers.forEach(playerId => {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        get().addLog({
          id: generateId(),
          round: state.round,
          phase: 'night',
          timestamp: new Date(),
          eventType: 'death',
          description: `${player.name}(${ROLES[player.role].name})在夜晚死亡`,
          players: [playerId]
        });
      }
    });
    
    // 保存夜晚行动
    const allNightActions = [...state.nightActions, ...state.currentNightActions.map(a => ({
      ...a,
      round: state.round
    }))];
    
    set({
      players: newPlayers,
      nightActions: allNightActions,
      phase: 'day',
      nightPhase: null,
      currentNightActions: [],
      deadTonight: []
    });

    // 检查游戏结束
    if (get().checkGameEnd()) {
      return;
    }

    // 开始白天阶段
    get().startDayPhase();
    autoSave(get());
  },
  
  startDayPhase: () => {
    const state = get();
    set({
      phase: 'day',
      currentSpeakerIndex: 0,
      currentVotes: {}
    });
    
    get().addLog({
      id: generateId(),
      round: state.round,
      phase: 'day',
      timestamp: new Date(),
      eventType: 'other',
      description: `第${state.round}天白天开始`
    });
  },
  
  startSpeechPhase: () => {
    const state = get();
    const alivePlayers = state.players.filter(p => p.isAlive);
    set({ currentSpeakerIndex: 0 });
  },
  
  nextSpeaker: () => {
    const state = get();
    const alivePlayers = state.players.filter(p => p.isAlive);
    if (state.currentSpeakerIndex < alivePlayers.length - 1) {
      set({ currentSpeakerIndex: state.currentSpeakerIndex + 1 });
    } else {
      // 发言结束，开始投票
      get().startVotePhase();
    }
  },
  
  startVotePhase: () => {
    set({
      phase: 'vote',
      currentVotes: {}
    });
  },
  
  submitVote: (voterId, targetId) => {
    const state = get();
    const newVotes = { ...state.currentVotes, [voterId]: targetId };
    set({ currentVotes: newVotes });
  },
  
  endVotePhase: () => {
    const state = get();
    
    // 统计投票结果
    const voteCounts: Record<string, number> = {};
    Object.values(state.currentVotes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
    
    // 找出最高票
    const maxVotes = Math.max(...Object.values(voteCounts));
    const topVoted = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
    
    // 如果平票，随机淘汰一人
    if (topVoted.length > 1) {
      const randomIndex = Math.floor(Math.random() * topVoted.length);
      const eliminatedId = topVoted[randomIndex];
      const eliminatedPlayer = state.players.find(p => p.id === eliminatedId);

      if (!eliminatedPlayer) return;

      // 检查白痴技能
      if (eliminatedPlayer.role === 'idiot' && !state.idiotRevealed) {
        set({ idiotRevealed: true });
        get().addLog({
          id: generateId(),
          round: state.round,
          phase: 'day',
          timestamp: new Date(),
          eventType: 'action',
          description: `${eliminatedPlayer.name}(白痴)翻牌免死（平票随机）`
        });
        set({ phase: 'night', round: state.round + 1 });
        return;
      }

      const newPlayers = state.players.map(p =>
        p.id === eliminatedId ? { ...p, isAlive: false } : p
      );

      get().addLog({
        id: generateId(),
        round: state.round,
        phase: 'day',
        timestamp: new Date(),
        eventType: 'death',
        description: `${eliminatedPlayer.name}(${ROLES[eliminatedPlayer.role].name})被投票出局（平票随机淘汰）`,
        players: [eliminatedId]
      });

      const voteAction = {
        round: state.round,
        actionType: 'vote' as const,
        votes: state.currentVotes,
        eliminatedId
      };

      set({
        players: newPlayers,
        dayActions: [...state.dayActions, voteAction],
        phase: 'night',
        round: state.round + 1
      });

      // 检查猎人技能
      if (eliminatedPlayer.role === 'hunter' && state.hunterCanShoot) {
        set({ pendingHunterShoot: true, hunterTarget: null });
        autoSave(get());
        return; // 不继续到 checkGameEnd，等猎人开枪后再检查
      }

      if (get().checkGameEnd()) {
        return;
      }

      get().startNightPhase();
      autoSave(get());
      return;
    }
    
    const eliminatedId = topVoted[0];
    const eliminatedPlayer = state.players.find(p => p.id === eliminatedId);
    
    if (!eliminatedPlayer) return;
    
    // 检查白痴技能
    if (eliminatedPlayer.role === 'idiot' && !state.idiotRevealed) {
      set({ idiotRevealed: true });
      get().addLog({
        id: generateId(),
        round: state.round,
        phase: 'day',
        timestamp: new Date(),
        eventType: 'action',
        description: `${eliminatedPlayer.name}(白痴)翻牌免死`
      });
      // 白痴免死，进入下一轮
      set({ phase: 'night', round: state.round + 1 });
      autoSave(get());
      return;
    }
    
    // 处理玩家出局
    const newPlayers = state.players.map(p => 
      p.id === eliminatedId ? { ...p, isAlive: false } : p
    );
    
    get().addLog({
      id: generateId(),
      round: state.round,
      phase: 'day',
      timestamp: new Date(),
      eventType: 'death',
      description: `${eliminatedPlayer.name}(${ROLES[eliminatedPlayer.role].name})被投票出局`,
      players: [eliminatedId]
    });
    
    // 保存投票记录
    const voteAction = {
      round: state.round,
      actionType: 'vote' as const,
      votes: state.currentVotes,
      eliminatedId
    };
    
    set({
      players: newPlayers,
      dayActions: [...state.dayActions, voteAction],
      phase: 'night',
      round: state.round + 1
    });
    
    // 检查猎人技能
    if (eliminatedPlayer.role === 'hunter' && state.hunterCanShoot) {
      set({ pendingHunterShoot: true, hunterTarget: null });
      autoSave(get());
      return; // 等待 UI 触发猎人开枪
    }
    
    // 检查游戏结束
    if (get().checkGameEnd()) {
      return;
    }
    
    // 开始下一夜
    get().startNightPhase();
    autoSave(get());
  },
  
  setCurrentPlayer: (index) => {
    set({ currentPlayerIndex: index });
  },
  
  showRole: (playerId) => {
    // 这个函数主要用于UI层面，不改变状态
  },
  
  hideRole: () => {
    // 这个函数主要用于UI层面，不改变状态
  },
  
  checkGameEnd: () => {
    const state = get();
    const aliveWerewolves = state.players.filter(p => p.isAlive && ROLES[p.role].camp === 'werewolf');
    const aliveVillagers = state.players.filter(p => p.isAlive && ROLES[p.role].camp === 'villager');
    
    // 狼人胜利条件：狼人数量 >= 好人数量
    if (aliveWerewolves.length >= aliveVillagers.length) {
      get().endGame('werewolf');
      return true;
    }
    
    // 好人胜利条件：所有狼人被消灭
    if (aliveWerewolves.length === 0) {
      get().endGame('villager');
      return true;
    }
    
    return false;
  },
  
  endGame: (winner) => {
    const state = get();
    set({
      phase: 'result',
      winner
    });

    get().addLog({
      id: generateId(),
      round: state.round,
      phase: 'day',
      timestamp: new Date(),
      eventType: 'result',
      description: winner === 'werewolf' ? '狼人阵营获胜' : '好人阵营获胜'
    });
    autoSave(get());
  },
  
  addLog: (entry) => {
    const state = get();
    set({ gameLog: [...state.gameLog, entry] });
  },
  
  resetGame: () => {
    set({
      ...initialState,
      settings: get().settings
    });
  },
  
  updateSettings: (newSettings) => {
    const state = get();
    set({ settings: { ...state.settings, ...newSettings } });
  },
  
  useWitchAntidote: (targetId) => {
    const state = get();
    if (!state.witchHasAntidote) return;
    
    get().executeNightAction({
      round: state.round,
      phase: 'witch',
      actorId: state.players.find(p => p.role === 'witch')?.id || '',
      actorRole: 'witch',
      targetId,
      actionType: 'save',
      result: { success: true, message: '使用解药救人' }
    });
  },
  
  useWitchPoison: (targetId) => {
    const state = get();
    if (!state.witchHasPoison) return;
    
    get().executeNightAction({
      round: state.round,
      phase: 'witch',
      actorId: state.players.find(p => p.role === 'witch')?.id || '',
      actorRole: 'witch',
      targetId,
      actionType: 'poison',
      result: { success: true, message: '使用毒药杀人' }
    });
  },
  
  hunterShoot: (targetId) => {
    const state = get();
    if (!state.hunterCanShoot) return;
    
    const target = state.players.find(p => p.id === targetId);
    if (!target) return;
    
    const newPlayers = state.players.map(p => 
      p.id === targetId ? { ...p, isAlive: false } : p
    );
    
    set({
      players: newPlayers,
      hunterCanShoot: false
    });
    
    get().addLog({
      id: generateId(),
      round: state.round,
      phase: 'day',
      timestamp: new Date(),
      eventType: 'death',
      description: `猎人开枪带走了${target.name}(${ROLES[target.role].name})`,
      players: [targetId]
    });
    
    // 检查游戏结束
    get().checkGameEnd();
  },
  
  idiotReveal: () => {
    set({ idiotRevealed: true });
  },

  setHunterTarget: (targetId) => {
    set({ hunterTarget: targetId });
  },

  confirmHunterShoot: () => {
    const state = get();
    if (!state.pendingHunterShoot || !state.hunterTarget) return;

    const targetId = state.hunterTarget;
    get().hunterShoot(targetId);

    set({ pendingHunterShoot: false, hunterTarget: null });

    if (!get().checkGameEnd()) {
      get().startNightPhase();
    }
    autoSave(get());
  },

  skipHunterShoot: () => {
    const state = get();
    if (!state.pendingHunterShoot) return;

    set({ pendingHunterShoot: false, hunterTarget: null });

    get().addLog({
      id: generateId(),
      round: state.round,
      phase: 'day',
      timestamp: new Date(),
      eventType: 'action',
      description: '猎人放弃开枪'
    });

    if (!get().checkGameEnd()) {
      get().startNightPhase();
    }
    autoSave(get());
  }
}));