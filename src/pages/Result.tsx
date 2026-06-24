import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, RotateCcw, Home, Clock, Users, Skull } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PlayerCard } from '../components/game/PlayerCard';
import { RoleCard } from '../components/role/RoleCard';
import { useGameStore } from '../store/gameStore';
import { ROLES, getCampName, getCampIcon } from '../data/roles';
import { clearGameState } from '../utils/storage';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const gameStore = useGameStore();
  
  const handleNewGame = () => {
    clearGameState();
    gameStore.resetGame();
    navigate('/');
  };
  
  const handleBackHome = () => {
    clearGameState();
    gameStore.resetGame();
    navigate('/');
  };
  
  const winner = gameStore.winner;
  const players = gameStore.players;
  const gameLog = gameStore.gameLog;
  
  // 统计数据
  const werewolfCount = players.filter(p => ROLES[p.role].camp === 'werewolf').length;
  const villagerCount = players.filter(p => ROLES[p.role].camp === 'villager').length;
  const aliveWerewolves = players.filter(p => p.isAlive && ROLES[p.role].camp === 'werewolf').length;
  const aliveVillagers = players.filter(p => p.isAlive && ROLES[p.role].camp === 'villager').length;
  const deadPlayers = players.filter(p => !p.isAlive);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Winner Banner */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">
            {winner === 'werewolf' ? '🐺' : '🎉'}
          </div>
          
          <div className={`text-3xl font-bold mb-2 ${
            winner === 'werewolf' ? 'text-red-400' : 'text-blue-400'
          }`}>
            {winner === 'werewolf' ? '狼人阵营获胜！' : '好人阵营获胜！'}
          </div>
          
          <div className="text-sm text-gray-400">
            游戏共进行了 {gameStore.round} 天
          </div>
        </motion.div>
        
        {/* Statistics */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              游戏统计
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50">
              <div className="text-xs text-red-400 mb-1">狼人阵营</div>
              <div className="text-xl font-bold text-red-300">
                {werewolfCount} 人
              </div>
              <div className="text-xs text-gray-400 mt-1">
                存活：{aliveWerewolves} 人
              </div>
            </div>
            
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
              <div className="text-xs text-blue-400 mb-1">好人阵营</div>
              <div className="text-xl font-bold text-blue-300">
                {villagerCount} 人
              </div>
              <div className="text-xs text-gray-400 mt-1">
                存活：{aliveVillagers} 人
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">死亡玩家</span>
              </div>
              <span className="text-sm font-medium text-gray-100">
                {deadPlayers.length} 人
              </span>
            </div>
          </div>
        </Card>
        
        {/* Player Roles */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              玩家身份
            </h2>
          </div>
          
          <div className="space-y-2">
            {players.map(player => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  !player.isAlive 
                    ? 'bg-gray-800/30 opacity-60' 
                    : ROLES[player.role].camp === 'werewolf'
                    ? 'bg-red-900/20 border border-red-700/50'
                    : 'bg-blue-900/20 border border-blue-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {ROLES[player.role].icon}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-100">
                      {player.name}
                    </div>
                    <div className={`text-xs ${
                      ROLES[player.role].camp === 'werewolf' 
                        ? 'text-red-400' 
                        : 'text-blue-400'
                    }`}>
                      {ROLES[player.role].name}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs">
                  {!player.isAlive ? (
                    <span className="text-red-400">已出局</span>
                  ) : (
                    <span className="text-green-400">存活</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
        
        {/* Game Log */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              游戏回顾
            </h2>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameLog.map((entry, index) => (
              <div
                key={entry.id}
                className="p-2 bg-gray-800/50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">
                    第{entry.round}{entry.phase === 'night' ? '夜' : '天'}
                  </span>
                  
                  <span className={`text-xs ${
                    entry.eventType === 'death' ? 'text-red-400' :
                    entry.eventType === 'result' ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    {entry.eventType === 'death' ? '死亡' :
                     entry.eventType === 'action' ? '行动' :
                     entry.eventType === 'vote' ? '投票' :
                     entry.eventType === 'result' ? '结果' : '其他'}
                  </span>
                </div>
                
                <div className="text-gray-300">
                  {entry.description}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleNewGame}
            className="w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            开始新游戏
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBackHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回首页
          </Button>
        </div>
      </motion.div>
    </div>
  );
};