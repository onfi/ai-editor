import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const colors = {
    light: {
      bg: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgTertiary: 'bg-gray-100',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      borderSecondary: 'border-gray-300',
      hover: 'hover:bg-gray-100',
      active: 'bg-blue-50 border-l-2 border-blue-500',
      button: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      folderIcon: 'text-blue-600',
      fileIcon: 'text-gray-500'
    },
    dark: {
      bg: 'bg-[#1E1F22]',
      bgSecondary: 'bg-[#2B2D31]',
      bgTertiary: 'bg-[#404249]',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-gray-600/30',
      borderSecondary: 'border-gray-700/50',
      hover: 'hover:bg-gray-700/30',
      active: 'bg-[#404249] border-l-2 border-blue-500',
      button: 'text-gray-400 hover:text-white hover:bg-gray-600/50',
      folderIcon: 'text-blue-400',
      fileIcon: 'text-gray-400'
    }
  };

  return {
    theme,
    setTheme,
    currentTheme,
    colors: colors[currentTheme],
    isDark: currentTheme === 'dark'
  };
};