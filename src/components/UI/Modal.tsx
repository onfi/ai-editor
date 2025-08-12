import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'md'
}) => {
  const { colors } = useThemeContext();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // フォーカス管理
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'sm:max-w-sm';
      case 'lg': return 'sm:max-w-lg';
      case 'xl': return 'sm:max-w-xl';
      default: return 'sm:max-w-md';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* 背景オーバーレイ */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
        
        {/* モーダルコンテンツ */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`relative transform overflow-hidden rounded-[3px] ${colors.bg} shadow-2xl transition-all duration-300 ease-out ${getMaxWidthClass()} w-full ${
            isOpen 
              ? 'opacity-100 translate-y-0 sm:scale-100' 
              : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* アイコン */}
              {icon && (
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                  <div className="h-6 w-6 text-blue-600 dark:text-blue-400">
                    {icon}
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                  <h3 
                    className={`text-lg font-semibold leading-6 ${colors.text}`}
                    id="modal-title"
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className={`rounded-full p-1 transition-colors ${colors.textMuted} hover:${colors.bgTertiary} hover:${colors.text}`}
                    aria-label="閉じる"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* コンテンツ */}
                <div className="mt-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};