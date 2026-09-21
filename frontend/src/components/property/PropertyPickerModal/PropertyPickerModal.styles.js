import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 18, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.textDark, fontSize: 16.5, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.borderDark },
  itemActive: { borderColor: colors.primary },
  name: { color: colors.textDark, fontSize: 14, fontWeight: '700' },
  loc: { color: colors.textMuted, fontSize: 11.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 11, borderRadius: 12, marginTop: 8, gap: 6 },
  addText: { color: colors.white, fontSize: 13.5, fontWeight: '700' },
});
