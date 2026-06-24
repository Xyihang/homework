import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Timer } from '../components/common/Timer';
import { PlayerCard, PlayerList } from '../components/game/PlayerCard';
import { RoleReveal } from '../components/role/RoleReveal';
import { useGameStore } from '../store/gameStore';
import { useSpeech } from '../hooks/useSpeech';
import { useTimer } from '../hooks/useTimer';
import { ROLES, RoleType } from '../data/roles';
import { SPEECH_MESSAGES } from '../data/messages';
import { Player, NightPhase } from '../types';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const gameStore = useGameStore();
  const { speak, stop } = useSpeech();
  
  const [showHandoff, setShowHandoff] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [currentActionPlayer, setCurrentActionPlayer] = useState<Player | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [witchChoice, setWitchChoice] = useState<'antidote' | 'poison' | 'none' | null>(null);
  const [seerResult, setSeerResult] = useState<{ player: Player; isWerewolf: boolean } | null>(null);

  // 用于解决循环依赖的 refs
  const handleActionCompleteRef = useRef<() => void>(() => {});
  const nextNightPhaseRef = useRef<() => Promise<void>>(async () => {});
  const startCurrentPhaseActionRef = useRef<() => Promise<void>>(async () => {});
  const timerRef = useRef<{ pause: () => void; reset: () => void; start: () => void }>({ pause: () => {}, reset: () => {}, start: () => {} });

  // timer 必须在 handleActionComplete 之前声明（因为后者引用前者）
  const timer = useTimer({
    initialTime: gameStore.settings.actionTime,
    onTimeUp: () => {
      handleActionCompleteRef.current();
    },
    onWarning: () => {
      speak(SPEECH_MESSAGES.TIME_WARNING);
    }
  });

  // 保持 timerRef 同步
  useEffect(() => {
    timerRef.current = { pause: timer.pause, reset: timer.reset, start: timer.start };
  }, [timer]);

  // 完成行动（通过 timerRef 访问 timer，避免初始化顺序问题）
  const handleActionComplete = useCallback(() => {
    timerRef.current.pause();
    setSelectedTarget(null);
    setWitchChoice(null);
    setSeerResult(null);
    setCurrentActionPlayer(null);

    nextNightPhaseRef.current();
  }, []);

  // 保持 ref 同步
  useEffect(() => {
    handleActionCompleteRef.current = handleActionComplete;
  }, [handleActionComplete]);
  
  // 语音播报
  useEffect(() => {
    if (gameStore.phase === 'night') {
      speak(SPEECH_MESSAGES.NIGHT_START);
    } else if (gameStore.phase === 'day') {
      speak(SPEECH_MESSAGES.DAY_START);
    }
  }, [gameStore.phase, gameStore.round, speak]);

  // 夜晚阶段自动开始行动
  useEffect(() => {
    if (gameStore.phase === 'night' && gameStore.nightPhase && !showHandoff && !showRoleReveal && !currentActionPlayer) {
      const timeoutId = setTimeout(() => startCurrentPhaseActionRef.current(), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [gameStore.phase, gameStore.nightPhase, showHandoff, showRoleReveal, currentActionPlayer]);

  // 获取当前行动的角色
  const getCurrentActionRole = useCallback((): RoleType | null => {
    if (gameStore.phase !== 'night') return null;

    const nightPhase = gameStore.nightPhase;
    if (!nightPhase) return null;

    // 找到该阶段需要行动的角色
    const actionRoles: Record<NightPhase, RoleType[]> = {
      werewolf: ['werewolf', 'wolfKing'],
      seer: ['seer'],
      witch: ['witch'],
      hunter: ['hunter'],
      other: []
    };

    const roles = actionRoles[nightPhase] || [];
    if (roles.length === 0) return null;

    // 找到存活的该角色玩家
    const alivePlayers = gameStore.players.filter(p => p.isAlive);
    for (const role of roles) {
      const player = alivePlayers.find(p => p.role === role);
      if (player) return role;
    }

    return null;
  }, [gameStore.phase, gameStore.nightPhase, gameStore.players]);

  // 获取当前行动的玩家
  const getCurrentActionPlayer = useCallback((): Player | null => {
    const role = getCurrentActionRole();
    if (!role) return null;

    return gameStore.players.find(p => p.role === role && p.isAlive) || null;
  }, [getCurrentActionRole, gameStore.players]);

  // 开始当前阶段行动
  const startCurrentPhaseAction = useCallback(async () => {
    const player = getCurrentActionPlayer();
    if (!player) {
      // 该阶段没有需要行动的角色，跳过
      nextNightPhaseRef.current();
      return;
    }

    setCurrentActionPlayer(player);
    setShowHandoff(true);

    // 播报提示
    const phase = gameStore.nightPhase;
    if (phase === 'werewolf') {
      await speak(SPEECH_MESSAGES.WEREWOLF_WAKE);
    } else if (phase === 'seer') {
      await speak(SPEECH_MESSAGES.SEER_WAKE);
    } else if (phase === 'witch') {
      await speak(SPEECH_MESSAGES.WITCH_WAKE);
    }
  }, [getCurrentActionPlayer, gameStore.nightPhase, speak]);

  // 保持 startCurrentPhaseActionRef 同步
  useEffect(() => {
    startCurrentPhaseActionRef.current = startCurrentPhaseAction;
  }, [startCurrentPhaseAction]);
  
  // 处理设备传递确认
  const handleHandoffConfirm = () => {
    setShowHandoff(false);
    setShowRoleReveal(true);
    
    if (gameStore.settings.timerEnabled) {
      timer.reset();
      timer.start();
    }
  };
  
  // 处理角色确认
  const handleRoleConfirm = () => {
    setShowRoleReveal(false);
  };
  
  // 选择目标
  const handleSelectTarget = (player: Player) => {
    if (!currentActionPlayer) return;
    
    // 检查是否可以选择该目标
    if (!player.isAlive) return;
    
    // 狼人不能选择自己
    if (gameStore.nightPhase === 'werewolf' && player.id === currentActionPlayer.id) return;
    
    setSelectedTarget(player.id);
  };
  
  // 执行行动
  const executeAction = async () => {
    if (!currentActionPlayer || !selectedTarget) return;
    
    const phase = gameStore.nightPhase;
    const target = gameStore.players.find(p => p.id === selectedTarget);
    
    if (!target) return;
    
    // 执行不同角色的行动
    if (phase === 'werewolf') {
      // 狼人杀人
      gameStore.executeNightAction({
        round: gameStore.round,
        phase: 'werewolf',
        actorId: currentActionPlayer.id,
        actorRole: currentActionPlayer.role,
        targetId: selectedTarget,
        actionType: 'kill'
      });
      
      await speak(SPEECH_MESSAGES.WEREWOLF_SLEEP);
    } else if (phase === 'seer') {
      // 预言家查验
      const isWerewolf = ROLES[target.role].camp === 'werewolf';
      setSeerResult({ player: target, isWerewolf });
      
      await speak(SPEECH_MESSAGES.SEER_RESULT(isWerewolf));
      
      gameStore.executeNightAction({
        round: gameStore.round,
        phase: 'seer',
        actorId: currentActionPlayer.id,
        actorRole: 'seer',
        targetId: selectedTarget,
        actionType: 'check',
        result: { success: true, message: isWerewolf ? '狼人' : '好人' }
      });
      
      await speak(SPEECH_MESSAGES.SEER_SLEEP);
    } else if (phase === 'witch') {
      // 女巫行动
      if (witchChoice === 'antidote') {
        gameStore.useWitchAntidote(selectedTarget);
      } else if (witchChoice === 'poison') {
        gameStore.useWitchPoison(selectedTarget);
      }
      
      await speak(SPEECH_MESSAGES.WITCH_SLEEP);
    }
    
    handleActionComplete();
  };
  
  // 进入下一个夜晚阶段
  const nextNightPhase = useCallback(async () => {
    const phases: NightPhase[] = ['werewolf', 'seer', 'witch', 'hunter', 'other'];
    const currentIndex = phases.indexOf(gameStore.nightPhase || 'werewolf');

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      gameStore.setNightPhase(nextPhase);
      // 不在这里调用 startCurrentPhaseAction，由 useEffect 自动触发
    } else {
      // 夜晚结束
      await speak(SPEECH_MESSAGES.NIGHT_END);
      gameStore.endNightPhase();
    }
  }, [gameStore.nightPhase, gameStore.setNightPhase, gameStore.endNightPhase, speak]);

  // 保持 nextNightPhaseRef 同步
  useEffect(() => {
    nextNightPhaseRef.current = nextNightPhase;
  }, [nextNightPhase]);
  
  // 渲染夜晚阶段
  if (gameStore.phase === 'night') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 px-4 py-8">
        {/* Handoff Screen */}
        {showHandoff && currentActionPlayer && (
          <HandoffScreen
            player={currentActionPlayer}
            onConfirm={handleHandoffConfirm}
          />
        )}
        
        {/* Role Reveal */}
        {showRoleReveal && currentActionPlayer && (
          <RoleReveal
            player={currentActionPlayer}
            onComplete={handleRoleConfirm}
            antiPeekMode={gameStore.settings.antiPeekMode}
          />
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Moon className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-gray-100">
                第 {gameStore.round} 夜
              </span>
            </div>
            
            <div className="text-sm text-gray-400">
              {gameStore.nightPhase === 'werewolf' && '狼人行动'}
              {gameStore.nightPhase === 'seer' && '预言家行动'}
              {gameStore.nightPhase === 'witch' && '女巫行动'}
              {gameStore.nightPhase === 'hunter' && '猎人行动'}
              {gameStore.nightPhase === 'other' && '其他角色行动'}
            </div>
          </div>
          
          {/* Action UI */}
          {currentActionPlayer && !showHandoff && !showRoleReveal && (
            <Card variant="bordered" className="mb-6">
              <div className="text-center mb-4">
                <div className="text-lg text-gray-100 mb-2">
                  {currentActionPlayer.name} 的行动
                </div>
                
                {gameStore.settings.timerEnabled && (
                  <Timer
                    time={timer.time}
                    isRunning={timer.isRunning}
                    showProgress
                    totalTime={gameStore.settings.actionTime}
                  />
                )}
              </div>
              
              {/* Target Selection */}
              {gameStore.nightPhase !== 'witch' && (
                <>
                  <div className="text-sm text-gray-400 mb-3">
                    选择目标玩家
                  </div>
                  
                  <PlayerList
                    players={gameStore.players.filter(p => p.isAlive)}
                    onSelect={handleSelectTarget}
                    selectedId={selectedTarget}
                    disabledIds={gameStore.nightPhase === 'werewolf' 
                      ? [currentActionPlayer.id] 
                      : []}
                    layout="grid"
                  />
                  
                  {selectedTarget && (
                    <Button
                      variant="primary"
                      onClick={executeAction}
                      className="w-full mt-4"
                    >
                      确认行动
                    </Button>
                  )}
                </>
              )}
              
              {/* Witch Special UI */}
              {gameStore.nightPhase === 'witch' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-400 mb-3">
                    女巫行动选择
                  </div>
                  
                  {/* 显示今晚被杀的人 */}
                  {gameStore.deadTonight.length > 0 && gameStore.witchHasAntidote && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50 mb-4">
                      <div className="text-sm text-red-400 mb-2">
                        今晚被杀的玩家：
                      </div>
                      <div className="text-gray-100">
                        {gameStore.players.find(p => p.id === gameStore.deadTonight[0])?.name}
                      </div>
                      
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setWitchChoice('antidote');
                          setSelectedTarget(gameStore.deadTonight[0]);
                        }}
                        className="w-full mt-2"
                      >
                        使用解药救人
                      </Button>
                    </div>
                  )}
                  
                  {/* 毒药选择 */}
                  {gameStore.witchHasPoison && (
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/50">
                      <div className="text-sm text-purple-400 mb-2">
                        使用毒药
                      </div>
                      
                      <PlayerList
                        players={gameStore.players.filter(p => 
                          p.isAlive && p.id !== currentActionPlayer.id
                        )}
                        onSelect={(player) => {
                          setWitchChoice('poison');
                          setSelectedTarget(player.id);
                        }}
                        selectedId={witchChoice === 'poison' ? selectedTarget : undefined}
                        layout="grid"
                      />
                    </div>
                  )}
                  
                  {/* 不使用技能 */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setWitchChoice('none');
                      handleActionComplete();
                    }}
                    className="w-full"
                  >
                    不使用技能
                  </Button>
                  
                  {/* 确认按钮 */}
                  {witchChoice && witchChoice !== 'none' && selectedTarget && (
                    <Button
                      variant="primary"
                      onClick={executeAction}
                      className="w-full"
                    >
                      确认行动
                    </Button>
                  )}
                </div>
              )}
              
              {/* Seer Result */}
              {seerResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg border"
                  style={{
                    backgroundColor: seerResult.isWerewolf 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(59, 130, 246, 0.2)',
                    borderColor: seerResult.isWerewolf 
                      ? 'rgba(239, 68, 68, 0.5)' 
                      : 'rgba(59, 130, 246, 0.5)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg mb-2">
                      {seerResult.player.name}
                    </div>
                    <div className={`text-xl font-bold ${
                      seerResult.isWerewolf ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {seerResult.isWerewolf ? '狼人' : '好人'}
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={handleActionComplete}
                    className="w-full mt-4"
                  >
                    我已记住，继续
                  </Button>
                </motion.div>
              )}
            </Card>
          )}
          
          {/* Waiting for next phase */}
          {!currentActionPlayer && !showHandoff && (
            <Card variant="bordered" className="mb-6">
              <div className="text-center text-gray-400">
                正在等待下一个阶段...
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    );
  }
  
  // 渲染白天阶段
  if (gameStore.phase === 'day') {
    return (
      <DayPhase
        gameStore={gameStore}
        speak={speak}
        navigate={navigate}
      />
    );
  }
  
  // 游戏未开始，重定向到首页
  if (!['night', 'day', 'result'].includes(gameStore.phase)) {
    navigate('/');
    return null;
  }

  // 渲染结果页面
  if (gameStore.phase === 'result') {
    navigate('/result');
    return null;
  }
  
  // 默认渲染
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-gray-400">加载中...</div>
    </div>
  );
};

// 设备传递界面
const HandoffScreen: React.FC<{
  player: Player;
  onConfirm: () => void;
}> = ({ player, onConfirm }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50"
    >
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">📱</div>
        
        <div className="text-xl text-gray-100 mb-4">
          请将设备传递给
        </div>
        
        <div className="text-3xl font-bold text-purple-400 mb-8">
          {player.name}
        </div>
        
        <Button
          variant="primary"
          size="lg"
          onClick={onConfirm}
          className="w-full"
        >
          我已收到设备
        </Button>
        
        <div className="mt-4 text-xs text-gray-500">
          ⚠️ 请确保其他玩家无法看到屏幕内容
        </div>
      </div>
    </motion.div>
  );
};

// 白天阶段组件
const DayPhase: React.FC<{
  gameStore: ReturnType<typeof useGameStore.getState>;
  speak: (text: string) => Promise<void>;
  navigate: (path: string) => void;
}> = ({ gameStore, speak, navigate }) => {
  const [phase, setPhase] = useState<'announce' | 'speech' | 'vote' | 'result'>('announce');
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});

  // 使用 ref 存储 speak 和 navigate 以避免重渲染循环
  const speakRef = useRef(speak);
  const navigateRef = useRef(navigate);

  // 保持 ref 最新
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const alivePlayers = gameStore.players.filter(p => p.isAlive);
  const currentSpeaker = alivePlayers[currentSpeakerIndex];

  useEffect(() => {
    if (phase === 'announce') {
      // 公布死讯
      const deadPlayers = gameStore.players.filter(p => !p.isAlive);
      const deadNames = deadPlayers.map(p => p.name);
      speakRef.current(SPEECH_MESSAGES.ANNOUNCE_DEATH(deadNames));

      setTimeout(() => {
        if (gameStore.checkGameEnd()) {
          navigateRef.current('/result');
        } else {
          setPhase('speech');
        }
      }, 2000);
    }
  }, [phase, gameStore.players, gameStore.checkGameEnd]);
  
  const handleNextSpeaker = () => {
    if (currentSpeakerIndex < alivePlayers.length - 1) {
      setCurrentSpeakerIndex(prev => prev + 1);
    } else {
      setPhase('vote');
    }
  };
  
  const handleVote = (voterId: string, targetId: string) => {
    setVotes(prev => ({ ...prev, [voterId]: targetId }));
  };
  
  const handleVoteComplete = () => {
    // 统计投票结果
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
    
    const maxVotes = Math.max(...Object.values(voteCounts));
    const topVoted = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
    
    if (topVoted.length > 1) {
      // 平票，需要重新投票
      speak(SPEECH_MESSAGES.VOTE_TIE);
      setVotes({});
    } else {
      // 处决
      const eliminatedId = topVoted[0];
      const eliminatedPlayer = gameStore.players.find(p => p.id === eliminatedId);
      
      if (eliminatedPlayer) {
        speak(SPEECH_MESSAGES.VOTE_RESULT(eliminatedPlayer.name));
        gameStore.submitVote(eliminatedId, eliminatedId);
        gameStore.endVotePhase();
        
        if (gameStore.checkGameEnd()) {
          navigate('/result');
        }
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold text-gray-100">
              第 {gameStore.round} 天
            </span>
          </div>
        </div>
        
        {/* Announce Phase */}
        {phase === 'announce' && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center">
              <div className="text-lg text-gray-100 mb-4">
                昨晚情况公布
              </div>
              
              {gameStore.players.filter(p => !p.isAlive).length > 0 ? (
                <div className="space-y-2">
                  {gameStore.players.filter(p => !p.isAlive).map(player => (
                    <div key={player.id} className="p-2 bg-red-900/20 rounded-lg">
                      <div className="text-red-400">
                        {player.name} 死亡
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-green-400">
                  平安夜，无人死亡
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Speech Phase */}
        {phase === 'speech' && currentSpeaker && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400 mb-2">
                发言环节
              </div>
              
              <div className="text-xl font-bold text-gray-100 mb-2">
                {currentSpeaker.name}
              </div>
              
              <div className="text-sm text-gray-400">
                座位号：{currentSpeaker.seatNumber}
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={handleNextSpeaker}
              className="w-full"
            >
              {currentSpeakerIndex < alivePlayers.length - 1 
                ? '下一位发言' 
                : '开始投票'}
            </Button>
          </Card>
        )}
        
        {/* Vote Phase */}
        {phase === 'vote' && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center mb-4">
              <div className="text-lg text-gray-100 mb-2">
                投票环节
              </div>
              
              <div className="text-sm text-gray-400">
                请选择要投票的玩家
              </div>
            </div>
            
            <div className="space-y-3">
              {alivePlayers.map(voter => (
                <div key={voter.id} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-300 mb-2">
                    {voter.name} 投票：
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {alivePlayers.filter(p => p.id !== voter.id).map(target => (
                      <button
                        key={target.id}
                        onClick={() => handleVote(voter.id, target.id)}
                        className={`p-2 rounded-lg text-xs ${
                          votes[voter.id] === target.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {target.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {Object.keys(votes).length === alivePlayers.length && (
              <Button
                variant="primary"
                onClick={handleVoteComplete}
                className="w-full mt-4"
              >
                确认投票结果
              </Button>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  );
};