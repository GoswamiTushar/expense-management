import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card: { backgroundColor: colors.cardDark, borderRadius: 20, padding: 18, width: '100%', maxWidth: 460, maxHeight: '80%', borderWidth: 1, borderColor: colors.borderDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.textDark, fontSize: 16.5, fontWeight: '800' },
  item: { backgroundColor: colors.surfaceDark, borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.borderDark },
  itemTitle: { color: colors.textDark, fontSize: 13, fontWeight: '700' },
  itemBody: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
});
