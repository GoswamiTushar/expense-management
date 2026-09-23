import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.cardDark, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderColor: colors.borderDark, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 12 },
  dragHandle: { width: 40, height: 4.5, borderRadius: 3, backgroundColor: '#475569', alignSelf: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderDark },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 12 },
  body: { paddingHorizontal: 18, paddingTop: 12 },
  label: { color: colors.textMuted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, marginTop: 10, marginBottom: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceDark, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.borderDark },
  currency: { color: colors.primary, fontSize: 26, fontWeight: '900', marginRight: 6 },
  amountInput: { color: colors.textDark, fontSize: 26, fontWeight: '900', flex: 1 },
  input: { backgroundColor: colors.surfaceDark, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, color: colors.textDark, fontSize: 13.5, borderWidth: 1, borderColor: colors.borderDark },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 13, borderRadius: 14, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  submitText: { color: colors.white, fontSize: 14.5, fontWeight: '800' },
});
