import React from 'react';

interface IconButtonProps {
  icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  className?: string;
  title?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  className = '',
  title,
  disabled = false,
}) => {
  const disabledStyles = disabled 
    ? 'opacity-40 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer active:scale-95';

  const baseStyles = 'px-2 py-2 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center justify-center relative';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseStyles} ${disabledStyles} ${className}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      <Icon size={24} />
    </button>
  );
};