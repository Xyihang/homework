import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Role, RoleType } from '../../types';
import { ROLES, getCampName, getCampIcon } from '../../data/roles';

interface RoleCardProps {
  roleType: RoleType;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  roleType,
  onClick,
  selected = false,
  size = 'md',
  showDetails = false
}) => {
  const role = ROLES[roleType];
  
  const sizes = {
    sm: 'w-20 h-24',
    md: 'w-32 h-40',
    lg: 'w-48 h-60'
  };
  
  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl'
  };
  
  const campColors = {
    werewolf: 'from-red-900/80 to-red-800/80 border-red-700',
    villager: 'from-blue-900/80 to-blue-800/80 border-blue-700'
  };
  
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      className={clsx(
        'rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        sizes[size],
        selected && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900',
        onClick && 'hover:shadow-xl'
      )}
      onClick={onClick}
    >
      <div className={clsx(
        'h-full flex flex-col items-center justify-center p-3',
        'bg-gradient-to-br',
        campColors[role.camp],
        'border',
        selected ? 'border-purple-500' : 'border-transparent'
      )}>
        <div className={clsx(iconSizes[size], 'mb-2')}>
          {role.icon}
        </div>
        
        <div className={clsx(
          'font-bold text-gray-100',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          {role.name}
        </div>
        
        {size !== 'sm' && (
          <div className={clsx(
            'text-xs text-gray-300 mt-1',
            role.camp === 'werewolf' ? 'text-red-300' : 'text-blue-300'
          )}>
            {getCampName(role.camp)}
          </div>
        )}
        
        {showDetails && size === 'lg' && (
          <div className="mt-3 text-xs text-gray-300 text-center leading-relaxed">
            {role.description}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 角色详情卡片
interface RoleDetailCardProps {
  role: Role;
  onClose?: () => void;
}

export const RoleDetailCard: React.FC<RoleDetailCardProps> = ({ role, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{role.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">{role.name}</h3>
            <p className={clsx(
              'text-sm',
              role.camp === 'werewolf' ? 'text-red-400' : 'text-blue-400'
            )}>
              {getCampIcon(role.camp)} {getCampName(role.camp)}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">角色描述</h4>
          <p className="text-gray-300 leading-relaxed">{role.description}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">技能说明</h4>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{role.skill}</p>
        </div>
        
        <div className="flex gap-2">
          {role.canActAtNight && (
            <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
              夜晚行动
            </span>
          )}
          {role.canActAtDay && (
            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">
              白天行动
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};