import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'bg-gray-800/50 backdrop-blur-sm',
    elevated: 'bg-gray-800 shadow-xl hover:shadow-2xl',
    bordered: 'bg-gray-800/50 border border-gray-700'
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const clickableStyles = onClick ? 'cursor-pointer hover:bg-gray-700/50' : '';
  
  return (
    <div
      className={clsx(baseStyles, variants[variant], paddings[padding], clickableStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};