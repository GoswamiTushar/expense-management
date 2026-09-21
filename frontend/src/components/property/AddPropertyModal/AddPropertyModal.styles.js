import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.cardDark, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, borderTopWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
