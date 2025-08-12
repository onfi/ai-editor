import React, { createContext, useContext, type ReactNode } from 'react';
import { useTheme, type Theme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentTheme: 'light' | 'dark';
  colors: {
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderSecondary: string;
    hover: string;
    active: string;
    button: string;
    folderIcon: string;
    fileIcon: string;
  };
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeProps = useTheme();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeProps.currentTheme);
  }, [themeProps.currentTheme]);

  return (
    <ThemeContext.Provider value={themeProps}>
      {children}
    </ThemeContext.Provider>
  );
};