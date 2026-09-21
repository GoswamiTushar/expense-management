import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: { marginTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800' },
  toggleText: { color: '#38BDF8', fontSize: 11.5, fontWeight: '700' },
  box: { backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.borderDark, gap: 8 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  platformBadge: { width: 85, color: colors.textDark, fontSize: 12, fontWeight: '700' },
  input: { flex: 1, backgroundColor: colors.cardDark, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: colors.textDark, fontSize: 12, borderWidth: 1, borderColor: colors.borderDark },
});
