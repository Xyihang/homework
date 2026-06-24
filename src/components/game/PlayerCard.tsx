import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Player } from '../../types';
import { ROLES } from '../../data/roles';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  selected = false,
  disabled = false,
  showRole = false,
  showStatus = true,
  size = 'md'
}) => {
  const role = ROLES[player.role];
  
  const sizes = {
    sm: 'w-24 h-32',
    md: 'w-32 h-40',
    lg: 'w-40 h-48'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <motion.div
      whileHover={{ scale: onClick && !disabled ? 1.05 : 1 }}
      whileTap={{ scale: onClick && !disabled ? 0.95 : 1 }}
      className={clsx(
        'rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        sizes[size],
        selected && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900',
        disabled && 'opacity-50 cursor-not-allowed',
        onClick && !disabled && 'hover:shadow-xl'
      )}
      onClick={() => !disabled && onClick?.()}
    >
      <div className={clsx(
        'relative h-full flex flex-col items-center justify-center p-3',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'border border-gray-700',
        selected && 'border-purple-500',
        !player.isAlive && 'opacity-60'
      )}>
        {/* 状态指示 */}
        {showStatus && (
          <div className="absolute top-2 right-2">
            {!player.isAlive ? (
              <div className="w-4 h-4 bg-red-500 rounded-full" />
            ) : (
              <div className="w-4 h-4 bg-green-500 rounded-full" />
            )}
          </div>
        )}
        
        {/* 角色/座位号 */}
        <div className={clsx('mb-2', textSizes[size])}>
          {showRole ? (
            <div className="text-3xl">{role.icon}</div>
          ) : (
            <div className="text-2xl font-bold text-gray-400">
              #{player.seatNumber}
            </div>
          )}
        </div>
        
        {/* 玩家名称 */}
        <div className={clsx(
          'font-medium text-gray-100 text-center',
          textSizes[size]
        )}>
          {player.name}
        </div>
        
        {/* 死亡标记 */}
        {!player.isAlive && showStatus && (
          <div className="mt-2 text-xs text-red-400">
            已出局
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 玩家列表组件
interface PlayerListProps {
  players: Player[];
  onSelect?: (player: Player) => void;
  selectedId?: string;
  disabledIds?: string[];
  showRole?: boolean;
  layout?: 'grid' | 'horizontal';
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onSelect,
  selectedId,
  disabledIds = [],
  showRole = false,
  layout = 'grid'
}) => {
  return (
    <div className={clsx(
      layout === 'grid' ? 'grid grid-cols-3 gap-3' : 'flex gap-3 overflow-x-auto pb-2'
    )}>
      {players.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onSelect?.(player)}
          selected={player.id === selectedId}
          disabled={disabledIds.includes(player.id) || !player.isAlive}
          showRole={showRole}
          size="md"
        />
      ))}
    </div>
  );
};