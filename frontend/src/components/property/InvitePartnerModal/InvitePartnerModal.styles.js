import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 20, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  genBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  genText: { color: colors.white, fontSize: 13.5, fontWeight: '800' },
  resultBox: { backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.borderDark, gap: 8 },
  codePill: { backgroundColor: colors.cardDark, padding: 8, borderRadius: 8, alignItems: 'center' },
  codeText: { color: '#38BDF8', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, backgroundColor: colors.cardDark, paddingVertical: 9, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.borderDark },
  actionText: { color: colors.textDark, fontSize: 12, fontWeight: '700' },
});
