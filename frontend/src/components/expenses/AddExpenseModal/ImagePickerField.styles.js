import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceDark, borderRadius: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.borderDark, gap: 6 },
  btnText: { color: colors.textDark, fontSize: 12, fontWeight: '600' },
  previewBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceDark, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.borderDark },
  previewText: { color: colors.success, fontSize: 12, fontWeight: '600' },
});
