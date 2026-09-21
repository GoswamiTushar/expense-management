import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceDark, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.borderDark },
  rowOweMe: { borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.06)' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  name: { color: colors.textDark, fontSize: 13.5, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 5 },
  amount: { fontSize: 14.5, fontWeight: '800' },
  payBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0284C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
  btnText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
