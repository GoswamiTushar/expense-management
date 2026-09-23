import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../../../theme/colors';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDark,
    paddingTop: STATUS_BAR_HEIGHT + 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  brandBox: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 28, height: 28, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  brandTitle: { color: colors.textDark, fontSize: 14.5, fontWeight: '800' },
  brandSub: { color: colors.textMuted, fontSize: 10.5 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 29, height: 29, borderRadius: 15, backgroundColor: colors.cardDark, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderDark },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.primary, borderRadius: 7, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontSize: 8, fontWeight: '800' },
  propertyBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardDark, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.borderDark },
  propText: { color: colors.textDark, fontSize: 12.5, fontWeight: '700', flex: 1 },
});
