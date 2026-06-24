// 语音播报文本
export const SPEECH_MESSAGES = {
  // 游戏开始
  GAME_START: '游戏开始，请各位玩家准备好。',
  
  // 角色分配
  ASSIGN_START: '现在开始分配角色，请各位玩家依次查看自己的身份。',
  ASSIGN_PLAYER: (name: string) => `请将设备传递给${name}`,
  ASSIGN_CONFIRM: '请确认你是设备持有者，点击查看身份。',
  ASSIGN_COMPLETE: '角色分配完成，游戏即将开始。',
  
  // 夜晚阶段
  NIGHT_START: '天黑请闭眼。',
  WEREWOLF_WAKE: '狼人请睁眼，请选择要击杀的目标。',
  WEREWOLF_SLEEP: '狼人请闭眼。',
  SEER_WAKE: '预言家请睁眼，请选择要查验的玩家。',
  SEER_RESULT: (isWerewolf: boolean) => isWerewolf ? '他是狼人。' : '他是好人。',
  SEER_SLEEP: '预言家请闭眼。',
  WITCH_WAKE: '女巫请睁眼。',
  WITCH_ANTIDOTE: (name: string | null) => name ? `今晚${name}被杀，是否使用解药？` : '今晚无人被杀，是否使用毒药？',
  WITCH_SLEEP: '女巫请闭眼。',
  HUNTER_WAKE: '猎人请睁眼，你已死亡，是否开枪？',
  HUNTER_SLEEP: '猎人请闭眼。',
  OTHER_WAKE: '其他角色请睁眼。',
  OTHER_SLEEP: '其他角色请闭眼。',
  NIGHT_END: '天亮了。',
  
  // 白天阶段
  DAY_START: '天亮了，请各位玩家睁眼。',
  ANNOUNCE_DEATH: (names: string[]) => names.length > 0 ? `昨晚${names.join('、')}死亡。` : '昨晚是平安夜，无人死亡。',
  SPEECH_START: '现在开始发言环节。',
  SPEECH_PLAYER: (name: string) => `请${name}发言。`,
  SPEECH_END: '发言环节结束。',
  VOTE_START: '现在开始投票环节，请各位玩家选择要投票的对象。',
  VOTE_END: '投票结束。',
  VOTE_RESULT: (name: string) => `${name}被投票出局。`,
  VOTE_TIE: '平票，请再次投票。',
  ELIMINATE: (name: string) => `${name}出局。`,
  LAST_WORDS: (name: string) => `请${name}发表遗言。`,
  
  // 特殊技能
  IDIOT_REVEAL: '白痴翻牌免死，但失去投票权。',
  HUNTER_SHOOT: '猎人开枪！',
  WOLF_KING_REVENGE: '狼王复仇！',
  
  // 游戏结束
  GAME_END_WEREWOLF_WIN: '游戏结束，狼人阵营获胜！',
  GAME_END_VILLAGER_WIN: '游戏结束，好人阵营获胜！',
  
  // 设备传递
  HANDOFF: (name: string) => `请将设备传递给${name}`,
  HANDOFF_CONFIRM: '我已收到设备',
  
  // 计时器
  TIME_UP: '时间到。',
  TIME_WARNING: '还剩10秒。',
  
  // 操作提示
  SELECT_TARGET: '请选择目标玩家。',
  CONFIRM_ACTION: '确认执行此操作？',
  CANCEL_ACTION: '取消操作。',
  ACTION_COMPLETE: '操作完成。'
};

// 游戏阶段文本
export const PHASE_TEXTS = {
  setup: '游戏设置',
  assign: '角色分配',
  night: '夜晚阶段',
  day: '白天阶段',
  vote: '投票阶段',
  result: '游戏结果'
};

// 夜晚阶段文本
export const NIGHT_PHASE_TEXTS = {
  werewolf: '狼人行动',
  seer: '预言家行动',
  witch: '女巫行动',
  hunter: '猎人行动',
  other: '其他角色行动'
};