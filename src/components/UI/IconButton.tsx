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

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`inline-block p-1 text-gray-600 rounded bg-transparent border-0 hover:bg-gray-200 transition-colors relative ${disabledStyles} ${className}`}
      title={title}
      disabled={disabled}
      type="button"
    >
      <div style={{ padding: '10px' }}>
        <Icon size={24} />
      </div>
    </button>
  );
};