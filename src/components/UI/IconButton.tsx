import React from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

interface IconButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  title?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  className = '',
  size = 'medium',
  variant = 'tertiary',
  title,
  disabled = false,
}) => {
  const { colors, isDark } = useThemeContext();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 p-1';
      case 'large':  
        return 'w-12 h-12 p-3';
      default: // medium
        return 'w-10 h-10 p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default: // medium
        return 20;
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg transition-all duration-150 ease-out flex items-center justify-center relative overflow-hidden';
    const hoverEffect = 'before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity hover:before:opacity-8';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} ${hoverEffect} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm`;
      case 'secondary':
        return `${baseStyles} ${hoverEffect} ${colors.bgSecondary} ${colors.text} border ${colors.border} hover:${colors.bgTertiary} active:${colors.bgTertiary}`;
      default: // tertiary
        return `${baseStyles} ${hoverEffect} ${colors.textSecondary} hover:${colors.bgTertiary} hover:${colors.text} active:${colors.bgTertiary}`;
    }
  };

  const disabledStyles = disabled 
    ? 'opacity-40 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer active:scale-95';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${getSizeStyles()} ${getVariantStyles()} ${disabledStyles} ${className}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      <Icon size={getIconSize()} />
    </button>
  );
};