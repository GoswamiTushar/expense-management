import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark, justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: colors.cardDark, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.borderDark },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { color: colors.textDark, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 12.5, marginTop: 3 },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.white },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', marginTop: 10, marginBottom: 5 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 13, borderRadius: 14, alignItems: 'center', marginTop: 18 },
  submitText: { color: colors.white, fontSize: 14.5, fontWeight: '800' },
  inviteLinkBtn: { alignItems: 'center', marginTop: 16 },
  inviteLinkText: { color: '#38BDF8', fontSize: 12.5, fontWeight: '600' },
});
