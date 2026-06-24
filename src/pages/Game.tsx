import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
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
  const { speak } = useSpeech();

  // UI 状态
  const [showHandoff, setShowHandoff] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [currentActionPlayer, setCurrentActionPlayer] = useState<Player | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [witchChoice, setWitchChoice] = useState<'antidote' | 'poison' | 'none' | null>(null);
  const [seerResult, setSeerResult] = useState<{ player: Player; isWerewolf: boolean } | null>(null);
  const [nightStep, setNightStep] = useState<'idle' | 'handoff' | 'action'>('idle');

  // 重定向逻辑（必须在所有 return 之前，避免 render 期间导航）
  const shouldRedirectHome = !['night', 'day', 'result'].includes(gameStore.phase);
  const shouldRedirectResult = gameStore.phase === 'result';
  useEffect(() => {
    if (shouldRedirectHome) navigate('/');
    else if (shouldRedirectResult) navigate('/result');
  }, [shouldRedirectHome, shouldRedirectResult]);
  if (shouldRedirectHome || shouldRedirectResult) return null;

  // timer 引用（用于在事件处理中访问）
  const timerInstanceRef = useRef<{ pause: () => void; reset: () => void; start: () => void } | null>(null);

  // ========== 纯函数定义（必须在 useTimer 之前，因为 onTimeUp 引用 handleActionComplete）==========

  /** 获取当前夜晚阶段需要行动的角色类型 */
  function getActionRole(): RoleType | null {
    if (gameStore.phase !== 'night') return null;
    const np = gameStore.nightPhase;
    if (!np) return null;

    const actionRoles: Record<NightPhase, RoleType[]> = {
      werewolf: ['werewolf', 'wolfKing'],
      seer: ['seer'],
      witch: ['witch'],
      hunter: ['hunter'],
      other: [],
    };

    for (const role of actionRoles[np] || []) {
      if (gameStore.players.some(p => p.isAlive && p.role === role)) return role;
    }
    return null;
  }

  /** 获取当前需要行动的玩家 */
  function getActionPlayer(): Player | null {
    const role = getActionRole();
    if (!role) return null;
    return gameStore.players.find(p => p.role === role && p.isAlive) || null;
  }

  /** 推进到下一个夜晚阶段 */
  async function advanceNightPhase() {
    const phases: NightPhase[] = ['werewolf', 'seer', 'witch', 'hunter', 'other'];
    const currentIdx = phases.indexOf(gameStore.nightPhase || 'werewolf');

    if (currentIdx < phases.length - 1) {
      gameStore.setNightPhase(phases[currentIdx + 1]);
    } else {
      await speak(SPEECH_MESSAGES.NIGHT_END);
      gameStore.endNightPhase();
    }
  }

  /** 完成当前角色行动，推进阶段 */
  function handleActionComplete() {
    timerInstanceRef.current?.pause();
    setSelectedTarget(null);
    setWitchChoice(null);
    setSeerResult(null);
    setCurrentActionPlayer(null);
    setNightStep('idle');
    advanceNightPhase();
  }

  /** 开始当前阶段的行动流程 */
  async function startPhaseAction() {
    const player = getActionPlayer();
    if (!player) {
      await advanceNightPhase();
      return;
    }
    setCurrentActionPlayer(player);
    setNightStep('handoff');

    const phase = gameStore.nightPhase;
    if (phase === 'werewolf') await speak(SPEECH_MESSAGES.WEREWOLF_WAKE);
    else if (phase === 'seer') await speak(SPEECH_MESSAGES.SEER_WAKE);
    else if (phase === 'witch') await speak(SPEECH_MESSAGES.WITCH_WAKE);
  }

  // Timer（在函数定义之后）
  const timer = useTimer({
    initialTime: gameStore.settings.actionTime,
    onTimeUp: handleActionComplete,
    onWarning: () => speak(SPEECH_MESSAGES.TIME_WARNING),
  });

  // 同步 timer 实例引用
  useEffect(() => {
    timerInstanceRef.current = { pause: timer.pause, reset: timer.reset, start: timer.start };
  }, [timer]);

  // ========== Effects ==========

  // 语音播报
  useEffect(() => {
    if (gameStore.phase === 'night') speak(SPEECH_MESSAGES.NIGHT_START);
    else if (gameStore.phase === 'day') speak(SPEECH_MESSAGES.DAY_START);
  }, [gameStore.phase, gameStore.round]);

  // 夜晚阶段状态机：核心驱动
  // 当 nightPhase 变化或回到 idle 状态时，自动启动下一阶段行动
  useEffect(() => {
    if (gameStore.phase !== 'night') return;
    if (!gameStore.nightPhase) return;

    // 只在 idle 状态且没有正在进行的交互时触发
    if (nightStep !== 'idle') return;
    if (showHandoff || showRoleReveal || currentActionPlayer) return;

    const t = setTimeout(startPhaseAction, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStore.phase, gameStore.nightPhase, nightStep]);

  // ========== 事件处理函数 ==========

  const handleHandoffConfirm = () => {
    setShowHandoff(false);
    setShowRoleReveal(true);
    setNightStep('action');

    if (gameStore.settings.timerEnabled) {
      timer.reset();
      timer.start();
    }
  };

  const handleRoleConfirm = () => {
    setShowRoleReveal(false);
  };

  const handleSelectTarget = (player: Player) => {
    if (!currentActionPlayer || !player.isAlive) return;
    if (gameStore.nightPhase === 'werewolf' && player.id === currentActionPlayer.id) return;
    setSelectedTarget(player.id);
  };

  const executeAction = async () => {
    if (!currentActionPlayer || !selectedTarget) return;

    const phase = gameStore.nightPhase;
    const target = gameStore.players.find(p => p.id === selectedTarget);
    if (!target) return;

    if (phase === 'werewolf') {
      gameStore.executeNightAction({
        round: gameStore.round,
        phase: 'werewolf',
        actorId: currentActionPlayer.id,
        actorRole: currentActionPlayer.role,
        targetId: selectedTarget,
        actionType: 'kill',
      });
      await speak(SPEECH_MESSAGES.WEREWOLF_SLEEP);
    } else if (phase === 'seer') {
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
        result: { success: true, message: isWerewolf ? '狼人' : '好人' },
      });
      await speak(SPEECH_MESSAGES.SEER_SLEEP);
    } else if (phase === 'witch') {
      if (witchChoice === 'antidote') gameStore.useWitchAntidote(selectedTarget);
      else if (witchChoice === 'poison') gameStore.useWitchPoison(selectedTarget);
      await speak(SPEECH_MESSAGES.WITCH_SLEEP);
    }

    handleActionComplete();
  };

  // ========== 渲染 ==========

  // 渲染夜晚阶段
  if (gameStore.phase === 'night') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900 px-4 py-8">
        {/* Handoff Screen */}
        {showHandoff && currentActionPlayer && (
          <HandoffScreen player={currentActionPlayer} onConfirm={handleHandoffConfirm} />
        )}

        {/* Role Reveal */}
        {showRoleReveal && currentActionPlayer && (
          <RoleReveal
            player={currentActionPlayer}
            onComplete={handleRoleConfirm}
            antiPeekMode={gameStore.settings.antiPeekMode}
          />
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Moon className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-gray-100">第 {gameStore.round} 夜</span>
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
                <div className="text-lg text-gray-100 mb-2">{currentActionPlayer.name} 的行动</div>
                {gameStore.settings.timerEnabled && (
                  <Timer time={timer.time} isRunning={timer.isRunning} showProgress totalTime={gameStore.settings.actionTime} />
                )}
              </div>

              {/* Target Selection (非女巫) */}
              {gameStore.nightPhase !== 'witch' && (
                <>
                  <div className="text-sm text-gray-400 mb-3">选择目标玩家</div>
                  <PlayerList
                    players={gameStore.players.filter(p => p.isAlive)}
                    onSelect={handleSelectTarget}
                    selectedId={selectedTarget}
                    disabledIds={gameStore.nightPhase === 'werewolf' ? [currentActionPlayer.id] : []}
                    layout="grid"
                  />
                  {selectedTarget && (
                    <Button variant="primary" onClick={executeAction} className="w-full mt-4">确认行动</Button>
                  )}
                </>
              )}

              {/* Witch Special UI */}
              {gameStore.nightPhase === 'witch' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-400 mb-3">女巫行动选择</div>

                  {gameStore.deadTonight.length > 0 && gameStore.witchHasAntidote && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50 mb-4">
                      <div className="text-sm text-red-400 mb-2">今晚被杀的玩家：</div>
                      <div className="text-gray-100">{gameStore.players.find(p => p.id === gameStore.deadTonight[0])?.name}</div>
                      <Button variant="secondary" onClick={() => { setWitchChoice('antidote'); setSelectedTarget(gameStore.deadTonight[0]); }} className="w-full mt-2">
                        使用解药救人
                      </Button>
                    </div>
                  )}

                  {gameStore.witchHasPoison && (
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/50">
                      <div className="text-sm text-purple-400 mb-2">使用毒药</div>
                      <PlayerList
                        players={gameStore.players.filter(p => p.isAlive && p.id !== currentActionPlayer!.id)}
                        onSelect={(p) => { setWitchChoice('poison'); setSelectedTarget(p.id); }}
                        selectedId={witchChoice === 'poison' ? selectedTarget : undefined}
                        layout="grid"
                      />
                    </div>
                  )}

                  <Button variant="ghost" onClick={() => { setWitchChoice('none'); handleActionComplete(); }} className="w-full">
                    不使用技能
                  </Button>

                  {witchChoice && witchChoice !== 'none' && selectedTarget && (
                    <Button variant="primary" onClick={executeAction} className="w-full">确认行动</Button>
                  )}
                </div>
              )}

              {/* Seer Result */}
              {seerResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg border"
                  style={{
                    backgroundColor: seerResult.isWerewolf ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                    borderColor: seerResult.isWerewolf ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)',
                  }}>
                  <div className="text-center">
                    <div className="text-lg mb-2">{seerResult.player.name}</div>
                    <div className={`text-xl font-bold ${seerResult.isWerewolf ? 'text-red-400' : 'text-blue-400'}`}>
                      {seerResult.isWerewolf ? '狼人' : '好人'}
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleActionComplete} className="w-full mt-4">我已记住，继续</Button>
                </motion.div>
              )}
            </Card>
          )}

          {/* Waiting */}
          {!currentActionPlayer && !showHandoff && (
            <Card variant="bordered" className="mb-6">
              <div className="text-center text-gray-400">正在等待下一个阶段...</div>
            </Card>
          )}
        </motion.div>
      </div>
    );
  }

  // 渲染白天阶段
  if (gameStore.phase === 'day') {
    return <DayPhase gameStore={gameStore} speak={speak} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-gray-400">加载中...</div>
    </div>
  );
};

// 设备传递界面
const HandoffScreen: React.FC<{ player: Player; onConfirm: () => void }> = ({ player, onConfirm }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
    <div className="text-center max-w-sm">
      <div className="text-5xl mb-6">📱</div>
      <div className="text-xl text-gray-100 mb-4">请将设备传递给</div>
      <div className="text-3xl font-bold text-purple-400 mb-8">{player.name}</div>
      <Button variant="primary" size="lg" onClick={onConfirm} className="w-full">我已收到设备</Button>
      <div className="mt-4 text-xs text-gray-500">⚠️ 请确保其他玩家无法看到屏幕内容</div>
    </div>
  </motion.div>
);

// 白天阶段组件
const DayPhase: React.FC<{
  gameStore: ReturnType<typeof useGameStore.getState>;
  speak: (text: string) => Promise<void>;
  navigate: (path: string) => void;
}> = ({ gameStore, speak, navigate }) => {
  const [phase, setPhase] = useState<'announce' | 'speech' | 'vote'>('announce');
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});

  const speakRef = useRef(speak);
  const navigateRef = useRef(navigate);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const alivePlayers = gameStore.players.filter(p => p.isAlive);

  useEffect(() => {
    if (phase !== 'announce') return;
    const deadNames = gameStore.players.filter(p => !p.isAlive).map(p => p.name);
    speakRef.current(SPEECH_MESSAGES.ANNOUNCE_DEATH(deadNames));
    setTimeout(() => {
      if (gameStore.checkGameEnd()) navigateRef.current('/result');
      else setPhase('speech');
    }, 2000);
  }, [phase, gameStore.players, gameStore.checkGameEnd]);

  const handleNextSpeaker = () => {
    setCurrentSpeakerIndex(prev => (prev < alivePlayers.length - 1 ? prev + 1 : (setPhase('vote'), prev)));
  };

  const handleVote = (voterId: string, targetId: string) => {
    setVotes(prev => ({ ...prev, [voterId]: targetId }));
  };

  const handleVoteComplete = () => {
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(id => { voteCounts[id] = (voteCounts[id] || 0) + 1; });

    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const topVoted = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);

    if (topVoted.length > 1) {
      speak(SPEECH_MESSAGES.VOTE_TIE);
      setVotes({});
      return;
    }

    const eliminatedId = topVoted[0];
    const eliminatedPlayer = gameStore.players.find(p => p.id === eliminatedId);
    if (eliminatedPlayer) {
      speak(SPEECH_MESSAGES.VOTE_RESULT(eliminatedPlayer.name));
      gameStore.submitVote(eliminatedId, eliminatedId);
      gameStore.endVotePhase();
      if (gameStore.checkGameEnd()) navigate('/result');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/20 to-gray-900 px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold text-gray-100">第 {gameStore.round} 天</span>
          </div>
        </div>

        {phase === 'announce' && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center">
              <div className="text-lg text-gray-100 mb-4">昨晚情况公布</div>
              {gameStore.players.some(p => !p.isAlive) ? (
                <div className="space-y-2">
                  {gameStore.players.filter(p => !p.isAlive).map(p => (
                    <div key={p.id} className="p-2 bg-red-900/20 rounded-lg"><span className="text-red-400">{p.name}</span> 死亡</div>
                  ))}
                </div>
              ) : <div className="text-green-400">平安夜，无人死亡</div>}
            </div>
          </Card>
        )}

        {phase === 'speech' && alivePlayers[currentSpeakerIndex] && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400 mb-2">发言环节</div>
              <div className="text-xl font-bold text-gray-100 mb-2">{alivePlayers[currentSpeakerIndex].name}</div>
              <div className="text-sm text-gray-400">座位号：{alivePlayers[currentSpeakerIndex].seatNumber}</div>
            </div>
            <Button variant="primary" onClick={handleNextSpeaker} className="w-full">
              {currentSpeakerIndex < alivePlayers.length - 1 ? '下一位发言' : '开始投票'}
            </Button>
          </Card>
        )}

        {phase === 'vote' && (
          <Card variant="bordered" className="mb-6">
            <div className="text-center mb-4">
              <div className="text-lg text-gray-100 mb-2">投票环节</div>
              <div className="text-sm text-gray-400">请选择要投票的玩家</div>
            </div>
            <div className="space-y-3">
              {alivePlayers.map(voter => (
                <div key={voter.id} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-300 mb-2">{voter.name} 投票：</div>
                  <div className="grid grid-cols-3 gap-2">
                    {alivePlayers.filter(p => p.id !== voter.id).map(target => (
                      <button key={target.id} onClick={() => handleVote(voter.id, target.id)}
                        className={`p-2 rounded-lg text-xs ${votes[voter.id] === target.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {target.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(votes).length === alivePlayers.length && (
              <Button variant="primary" onClick={handleVoteComplete} className="w-full mt-4">确认投票结果</Button>
            )}
          </Card>
        )}
      </motion.div>
    </div>
  );
};
