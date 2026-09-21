import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 20, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  joinBtn: { backgroundColor: colors.success, paddingVertical: 13, borderRadius: 14, alignItems: 'center', marginTop: 18 },
  btnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
