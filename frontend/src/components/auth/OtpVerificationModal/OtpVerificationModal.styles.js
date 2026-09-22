import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.white, fontSize: 18, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  emailText: { color: colors.primary, fontWeight: '700' },
  label: { color: colors.textDim, fontSize: 11, fontWeight: '800', marginTop: 18, marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.white, fontSize: 22, fontWeight: '800', letterSpacing: 8, textAlign: 'center', borderWidth: 1, borderColor: colors.borderDark },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  verifyBtn: { backgroundColor: colors.primary, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  verifyText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, gap: 4 },
  resendPrompt: { color: colors.textMuted, fontSize: 12 },
  resendLink: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
