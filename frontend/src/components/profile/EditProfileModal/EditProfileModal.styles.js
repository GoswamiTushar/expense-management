import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 20, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  hint: { color: colors.textDim, fontSize: 11, marginTop: 4 },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 18 },
  btnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  logoutBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: '700' },
});
