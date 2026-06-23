import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Player } from '../../types';
import { ROLES, getCampName, getCampIcon } from '../../data/roles';

interface RoleRevealProps {
  player: Player;
  onComplete: () => void;
  antiPeekMode?: boolean;
}

export const RoleReveal: React.FC<RoleRevealProps> = ({
  player,
  onComplete,
  antiPeekMode = false
}) => {
  const [revealed, setRevealed] = useState(false);
  const role = ROLES[player.role];
  
  const handleReveal = () => {
    setRevealed(true);
  };
  
  const handleConfirm = () => {
    setRevealed(false);
    onComplete();
  };
  
  const campColors = {
    werewolf: 'from-red-900/90 to-red-800/90',
    villager: 'from-blue-900/90 to-blue-800/90'
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={clsx(
          'relative rounded-xl overflow-hidden',
          antiPeekMode ? 'max-w-xs' : 'max-w-md w-full'
        )}
      >
        {!revealed ? (
          // 隐藏状态
          <div className="bg-gray-900 p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">❓</div>
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                {player.name}
              </h2>
              <p className="text-gray-400">
                点击下方按钮查看你的身份
              </p>
            </div>
            
            <button
              onClick={handleReveal}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              查看身份
            </button>
            
            {antiPeekMode && (
              <div className="mt-4 text-xs text-gray-500">
                ⚠️ 防偷窥模式已启用，请确保周围无人
              </div>
            )}
          </div>
        ) : (
          // 显示状态
          <div className={clsx(
            'bg-gradient-to-br p-8 text-center',
            campColors[role.camp]
          )}>
            <div className="mb-6">
              <div className="text-7xl mb-4">{role.icon}</div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                {role.name}
              </h2>
              <p className={clsx(
                'text-sm mb-4',
                role.camp === 'werewolf' ? 'text-red-300' : 'text-blue-300'
              )}>
                {getCampIcon(role.camp)} {getCampName(role.camp)}
              </p>
              
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {role.skill}
                </p>
              </div>
              
              {!antiPeekMode && (
                <p className="text-gray-300 text-xs">
                  座位号：{player.seatNumber}
                </p>
              )}
            </div>
            
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              我已确认，继续游戏
            </button>
            
            {antiPeekMode && (
              <div className="mt-4 text-xs text-gray-400">
                ⚠️ 确认后身份将隐藏，请勿让他人看到
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};