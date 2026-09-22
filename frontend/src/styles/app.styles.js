import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bgDark },
  container: {
    flex: 1, maxWidth: 580, width: '100%', alignSelf: 'center', backgroundColor: colors.bgDark,
    ...(Platform.OS === 'web' ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.borderDark } : {}),
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  sectionTitleBox: { minWidth: 110, flexShrink: 1 },
  title: { color: colors.textDark, fontSize: 15, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 11 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: colors.borderDark, gap: 4 },
  btnText: { color: colors.textDark, fontSize: 11, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 28, elevation: 8, gap: 6 },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  emptyBox: { backgroundColor: colors.cardDark, borderRadius: 16, padding: 24, marginHorizontal: 18, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.borderDark },
  emptyTitle: { color: colors.textDark, fontSize: 16, fontWeight: '800', marginTop: 10 },
  emptySub: { color: colors.textMuted, fontSize: 12.5, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
