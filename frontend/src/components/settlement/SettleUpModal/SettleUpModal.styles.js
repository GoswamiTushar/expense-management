import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 22, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  promptBox: { backgroundColor: colors.surfaceDark, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: colors.borderDark },
  promptText: { color: colors.textDark, fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  amountHighlight: { color: colors.warning, fontWeight: '900', fontSize: 18 },
  partnerHighlight: { color: colors.white, fontWeight: '900' },
  upiPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 8, gap: 5 },
  upiText: { color: '#38BDF8', fontSize: 11.5, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: colors.surfaceDark, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.borderDark },
  cancelText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  payBtn: { flex: 2, backgroundColor: '#0284C7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
  payText: { color: colors.white, fontSize: 13.5, fontWeight: '800' },
  doneBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, padding: 12, marginVertical: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)' },
  donePrompt: { color: '#A7F3D0', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  settleBtn: { backgroundColor: colors.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
  settleText: { color: colors.white, fontSize: 13.5, fontWeight: '800' },
});
