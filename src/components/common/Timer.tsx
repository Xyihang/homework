import React from 'react';
import { clsx } from 'clsx';

interface TimerProps {
  time: number;
  isRunning: boolean;
  variant?: 'default' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  totalTime?: number;
}

export const Timer: React.FC<TimerProps> = ({
  time,
  isRunning,
  variant = 'default',
  size = 'md',
  showProgress = false,
  totalTime = 60
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getVariant = () => {
    if (time <= 10) return 'danger';
    if (time <= 30) return 'warning';
    return variant;
  };
  
  const currentVariant = getVariant();
  
  const variants = {
    default: 'text-gray-100',
    warning: 'text-yellow-400',
    danger: 'text-red-400 animate-pulse'
  };
  
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  
  const progressPercentage = (time / totalTime) * 100;
  
  return (
    <div className="flex flex-col items-center gap-2">
      {showProgress && (
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-1000 ease-linear',
              currentVariant === 'danger' ? 'bg-red-500' : 
              currentVariant === 'warning' ? 'bg-yellow-500' : 'bg-purple-500'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      
      <div className={clsx(
        'font-mono font-bold',
        variants[currentVariant],
        sizes[size],
        isRunning && 'transition-colors'
      )}>
        {formatTime(time)}
      </div>
      
      {isRunning && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">计时中</span>
        </div>
      )}
    </div>
  );
};