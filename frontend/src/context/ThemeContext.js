import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, getLiquidGlass, setGlobalTheme } from '../theme/colors';

const THEME_STORAGE_KEY = '@app_theme_mode_v1';

const ThemeContext = createContext({
  isDark: true,
  theme: 'dark',
  colors: darkColors,
  glass: getLiquidGlass(true),
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
          setGlobalTheme(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference:', err);
      }
    })();
  }, []);

  const setTheme = async (mode) => {
    const validMode = mode === 'light' ? 'light' : 'dark';
    setThemeState(validMode);
    setGlobalTheme(validMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, validMode);
    } catch (err) {
      console.warn('Failed to save theme preference:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const glass = getLiquidGlass(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, theme, colors, glass, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
