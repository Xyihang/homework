import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, Shuffle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useGameStore } from '../store/gameStore';
import { generateId } from '../data/roles';
import { Player } from '../types';

export const Players: React.FC = () => {
  const navigate = useNavigate();
  const playerCount = useGameStore(state => state.playerCount);
  const setPlayers = useGameStore(state => state.setPlayers);
  
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  
  const handleAddPlayer = () => {
    if (!currentInput.trim()) return;
    if (playerNames.length >= playerCount) return;
    
    setPlayerNames(prev => [...prev, currentInput.trim()]);
    setCurrentInput('');
  };
  
  const handleRemovePlayer = (index: number) => {
    setPlayerNames(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleShuffle = () => {
    const shuffled = [...playerNames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPlayerNames(shuffled);
  };
  
  const handleNext = () => {
    if (playerNames.length !== playerCount) return;
    
    // 创建玩家对象
    const players: Player[] = playerNames.map((name, index) => ({
      id: generateId(),
      name,
      role: 'villager', // 临时角色，后续会分配
      isAlive: true,
      hasUsedAbility: false,
      seatNumber: index + 1
    }));
    
    setPlayers(players);
    navigate('/assign');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/setup')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-100">登记玩家</h1>
          
          <div className="w-5" />
        </div>
        
        {/* Player Count Info */}
        <Card variant="bordered" className="mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">
              需要登记 {playerCount} 名玩家
            </div>
            
            <div className="text-3xl font-bold text-purple-400">
              {playerNames.length} / {playerCount}
            </div>
            
            {playerNames.length === playerCount && (
              <div className="mt-2 text-xs text-green-400">
                ✓ 已登记完成
              </div>
            )}
          </div>
        </Card>
        
        {/* Add Player */}
        <Card variant="bordered" className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder="输入玩家姓名"
              maxLength={10}
              disabled={playerNames.length >= playerCount}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none disabled:opacity-50"
            />
            
            <Button
              variant="primary"
              onClick={handleAddPlayer}
              disabled={!currentInput.trim() || playerNames.length >= playerCount}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加
            </Button>
          </div>
          
          {/* Player List */}
          {playerNames.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">玩家列表</span>
                
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                >
                  <Shuffle className="w-3 h-3" />
                  随机排序
                </button>
              </div>
              
              {playerNames.map((name, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-medium text-white">
                      {index + 1}
                    </div>
                    
                    <span className="text-gray-100">{name}</span>
                  </div>
                  
                  <button
                    onClick={() => handleRemovePlayer(index)}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
        
        {/* Quick Add */}
        {playerNames.length < playerCount && (
          <Card variant="bordered" className="mb-6">
            <div className="text-sm text-gray-400 mb-3">
              快速添加（点击自动生成姓名）
            </div>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(3, playerCount - playerNames.length) }).map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => {
                    setPlayerNames(prev => [...prev, `玩家${prev.length + 1}`]);
                  }}
                  className="flex-1"
                >
                  玩家{playerNames.length + i + 1}
                </Button>
              ))}
            </div>
          </Card>
        )}
        
        {/* Next Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={playerNames.length !== playerCount}
          className="w-full flex items-center justify-center gap-2"
        >
          下一步：分配角色
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};