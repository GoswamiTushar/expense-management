import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 18, width: '100%', maxWidth: 480, maxHeight: '82%', borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { color: colors.textDark, fontSize: 16.5, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 11.5, marginBottom: 12 },
  item: { backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.borderDark },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actor: { color: colors.textDark, fontSize: 13, fontWeight: '700' },
  amount: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  time: { color: colors.textDim, fontSize: 10.5, marginTop: 4 },
});
