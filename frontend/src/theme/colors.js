import { Platform } from 'react-native';

export const darkColors = {
  isDark: true,
  // Primary & Accents (Obsidian Titanium - Electric Iris & Apple Emerald)
  primary: '#5E5CE6',
  primaryLight: '#7E7DF8',
  primaryDark: '#4340D8',
  primaryGlass: 'rgba(94, 92, 230, 0.16)',
  secondary: '#30D158',
  tertiary: '#E06D53',
  tertiaryGlass: 'rgba(224, 109, 83, 0.15)',
  
  // Surfaces & Backgrounds (Stitch Obsidian Titanium)
  bgDark: '#0C0E14',
  surfaceDark: 'rgba(18, 22, 32, 0.88)',
  cardDark: '#151821',                   // Titanium content card
  cardElevated: '#181B26',
  borderDark: '#232838',                 // Hairline separator
  borderLight: 'rgba(255, 255, 255, 0.14)',
  
  // CTA & Interactive Element Overrides (as in Stitch Screen 4)
  heroCtaBg: '#FFFFFF',
  heroCtaText: '#0C0E14',
  chipActiveBg: '#FFFFFF',
  chipActiveText: '#0C0E14',
  centerBtnBg: '#FFFFFF',
  centerBtnIcon: '#0C0E14',
  neutralBtnBg: '#1E2332',
  neutralBtnBorder: '#2A3246',
  neutralBtnText: '#FFFFFF',
  
  // Labels
  textDark: '#FFFFFF',
  textMuted: '#8E95A5',
  textDim: '#5A6275',
  
  // Status Colors
  success: '#30D158',
  warning: '#E06D53',                    // Warm coral for pending debt
  danger: '#FF453A',
  info: '#5E5CE6',
  white: '#FFFFFF',
  
  // Refraction Tokens
  glassBg: 'rgba(21, 24, 33, 0.85)',
  glassBorderTop: 'rgba(255, 255, 255, 0.22)',
  glassBorderBottom: 'rgba(0, 0, 0, 0.45)',
  glassBorderSides: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
  
  inputBg: '#0F1219',
  inputBorder: '#232838',
  pillBg: '#181B26',
  elevatedCard: '#151821',
  modalBackdrop: 'rgba(0, 0, 0, 0.78)',
  modalCard: '#151821',
  shadowColor: '#000000',
  shadowOpacity: 0.45,
};

export const lightColors = {
  isDark: false,
  // Primary & Accents (Obsidian Slate for crisp contrast, Electric Iris for focus)
  primary: '#0F172A',
  primaryLight: '#1E293B',
  primaryDark: '#020617',
  primaryGlass: 'rgba(15, 23, 42, 0.06)',
  primaryAccent: '#5E5CE6',
  secondary: '#10B981',
  tertiary: '#E06D53',
  tertiaryGlass: 'rgba(224, 109, 83, 0.12)',
  
  // Surfaces & Backgrounds (Crisp Apple Porcelain Canvas)
  bgDark: '#F8FAFC',
  surfaceDark: 'rgba(255, 255, 255, 0.92)',
  cardDark: '#FFFFFF',
  cardElevated: '#FFFFFF',
  borderDark: 'rgba(15, 23, 42, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.95)',
  
  // CTA & Interactive Element Overrides
  heroCtaBg: '#0F172A',
  heroCtaText: '#FFFFFF',
  chipActiveBg: '#0F172A',
  chipActiveText: '#FFFFFF',
  centerBtnBg: '#0F172A',
  centerBtnIcon: '#FFFFFF',
  neutralBtnBg: '#F1F5F9',
  neutralBtnBorder: 'rgba(15, 23, 42, 0.08)',
  neutralBtnText: '#0F172A',
  
  // Labels
  textDark: '#0F172A',
  textMuted: '#64748B',
  textDim: '#94A3B8',
  
  // Status Colors
  success: '#10B981',
  warning: '#E06D53',
  danger: '#EF4444',
  info: '#5E5CE6',
  white: '#FFFFFF',
  
  // Refraction Tokens
  glassBg: 'rgba(255, 255, 255, 0.88)',
  glassBorderTop: 'rgba(255, 255, 255, 0.95)',
  glassBorderBottom: 'rgba(0, 0, 0, 0.05)',
  glassBorderSides: 'rgba(0, 0, 0, 0.04)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  
  inputBg: '#F1F5F9',
  inputBorder: 'rgba(15, 23, 42, 0.08)',
  pillBg: 'rgba(15, 23, 42, 0.04)',
  elevatedCard: '#FFFFFF',
  modalBackdrop: 'rgba(15, 23, 42, 0.40)',
  modalCard: 'rgba(255, 255, 255, 0.98)',
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
};

/**
 * Creates Apple Liquid Glass style with specular edge highlights and inner light refraction
 */
export const getLiquidGlass = (isDark = true) => ({
  backgroundColor: isDark ? 'rgba(21, 24, 33, 0.85)' : 'rgba(255, 255, 255, 0.88)',
  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.95)',
  borderBottomColor: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.05)',
  borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  borderWidth: 1,
  ...(Platform.OS === 'web'
    ? {
        backdropFilter: 'blur(32px) saturate(190%) contrast(104%)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%) contrast(104%)',
        boxShadow: isDark
          ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.16), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.32), 0 16px 36px -6px rgba(0, 0, 0, 0.55)'
          : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.03), 0 12px 28px -4px rgba(15, 23, 42, 0.06)',
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: 20,
        elevation: 8,
      }),
});

// Backward-compatible mutable colors object
export const colors = { ...darkColors };

export const setGlobalTheme = (mode) => {
  const next = mode === 'light' ? lightColors : darkColors;
  Object.assign(colors, next);
};
