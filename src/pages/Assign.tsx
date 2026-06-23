import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { RoleReveal } from '../components/role/RoleReveal';
import { useGameStore } from '../store/gameStore';
import { shuffleArray, getRoleList, ROLES } from '../data/roles';
import { Player, RoleType } from '../types';

export const Assign: React.FC = () => {
  const navigate = useNavigate();
  const players = useGameStore(state => state.players);
  const roleConfig = useGameStore(state => state.roleConfig);
  const setPlayers = useGameStore(state => state.setPlayers);
  const startGame = useGameStore(state => state.startGame);
  const settings = useGameStore(state => state.settings);
  
  const [assignedPlayers, setAssignedPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [allConfirmed, setAllConfirmed] = useState(false);
  
  // 分配角色
  useEffect(() => {
    if (players.length === 0) return;
    
    // 生成角色列表
    const roles = getRoleList(roleConfig as Record<RoleType, number>);
    const shuffledRoles = shuffleArray(roles);
    
    // 分配给玩家
    const assigned = players.map((player, index) => ({
      ...player,
      role: shuffledRoles[index]
    }));
    
    setAssignedPlayers(assigned);
  }, [players, roleConfig]);
  
  const currentPlayer = assignedPlayers[currentPlayerIndex];
  
  const handleStartAssign = () => {
    setShowRoleReveal(true);
  };
  
  const handlePlayerConfirm = () => {
    setShowRoleReveal(false);
    
    if (currentPlayerIndex < assignedPlayers.length - 1) {
      // 还有玩家未确认
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      // 所有玩家已确认
      setAllConfirmed(true);
      setPlayers(assignedPlayers);
    }
  };
  
  const handleStartGame = () => {
    startGame();
    navigate('/game');
  };
  
  if (assignedPlayers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 py-8">
      {/* Role Reveal Overlay */}
      {showRoleReveal && currentPlayer && (
        <RoleReveal
          player={currentPlayer}
          onComplete={handlePlayerConfirm}
          antiPeekMode={settings.antiPeekMode}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/players')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-100">角色分配</h1>
          
          <div className="w-5" />
        </div>
        
        {!allConfirmed ? (
          <>
            {/* Progress */}
            <Card variant="bordered" className="mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">
                  请依次让每位玩家查看自己的身份
                </div>
                
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {currentPlayerIndex + 1} / {assignedPlayers.length}
                </div>
                
                <div className="text-lg text-gray-100 mb-4">
                  下一位：{currentPlayer?.name}
                </div>
                
                {/* Player List */}
                <div className="space-y-2">
                  {assignedPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        index < currentPlayerIndex
                          ? 'bg-green-900/20 border border-green-700/50'
                          : index === currentPlayerIndex
                          ? 'bg-purple-900/20 border border-purple-700/50'
                          : 'bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index < currentPlayerIndex
                            ? 'bg-green-600 text-white'
                            : index === currentPlayerIndex
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {index < currentPlayerIndex ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        <span className={`${
                          index === currentPlayerIndex ? 'text-purple-300' : 'text-gray-300'
                        }`}>
                          {player.name}
                        </span>
                      </div>
                      
                      {index < currentPlayerIndex && (
                        <span className="text-xs text-green-400">已确认</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Instructions */}
            <Card variant="bordered" className="mb-6">
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <div className="text-purple-400">1.</div>
                  <div>将设备传递给 {currentPlayer?.name}</div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-purple-400">2.</div>
                  <div>让 {currentPlayer?.name} 点击下方按钮查看身份</div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="text-purple-400">3.</div>
                  <div>确认后设备将自动进入传递状态</div>
                </div>
                
                {settings.antiPeekMode && (
                  <div className="mt-4 text-xs text-yellow-400 bg-yellow-900/20 rounded p-2">
                    ⚠️ 防偷窥模式已启用，请确保周围无人偷看
                  </div>
                )}
              </div>
            </Card>
            
            {/* Start Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAssign}
              className="w-full"
            >
              让 {currentPlayer?.name} 查看身份
            </Button>
          </>
        ) : (
          <>
            {/* All Confirmed */}
            <Card variant="bordered" className="mb-6">
              <div className="text-center">
                <div className="text-5xl mb-4">✓</div>
                
                <div className="text-xl font-bold text-green-400 mb-2">
                  所有玩家已确认身份
                </div>
                
                <div className="text-sm text-gray-400 mb-4">
                  游戏即将开始，请准备好
                </div>
                
                {/* Camp Summary */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50">
                    <div className="text-sm text-red-400 mb-1">狼人阵营</div>
                    <div className="text-2xl font-bold text-red-300">
                      {assignedPlayers.filter(p => ROLES[p.role].camp === 'werewolf').length}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <div className="text-sm text-blue-400 mb-1">好人阵营</div>
                    <div className="text-2xl font-bold text-blue-300">
                      {assignedPlayers.filter(p => ROLES[p.role].camp === 'villager').length}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Game Rules Reminder */}
            <Card variant="bordered" className="mb-6">
              <div className="text-sm text-gray-300 space-y-2">
                <div className="font-medium text-gray-200">游戏提示</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>游戏将从夜晚阶段开始</li>
                  <li>请按照语音提示依次行动</li>
                  <li>设备将在玩家间传递</li>
                  <li>请勿让他人看到你的角色信息</li>
                </ul>
              </div>
            </Card>
            
            {/* Start Game Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartGame}
              className="w-full flex items-center justify-center gap-2"
            >
              开始游戏
              <ArrowRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
};