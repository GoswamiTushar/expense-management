import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: { backgroundColor: colors.surfaceDark, paddingTop: 12, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.borderDark },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  brandBox: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brandTitle: { color: colors.textDark, fontSize: 15.5, fontWeight: '800' },
  brandSub: { color: colors.textMuted, fontSize: 11 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardDark, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderDark },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  propertyBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardDark, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark },
  propText: { color: colors.textDark, fontSize: 13, fontWeight: '700', flex: 1 },
});
