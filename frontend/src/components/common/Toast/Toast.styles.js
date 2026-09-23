import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, zIndex: 9999, alignItems: 'center' },
  card: {
    maxWidth: 500, width: '100%', backgroundColor: colors.cardDark, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderDark,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  content: { flex: 1 },
  title: { color: colors.textDark, fontSize: 13.5, fontWeight: '700', marginBottom: 2 },
  message: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },
});
