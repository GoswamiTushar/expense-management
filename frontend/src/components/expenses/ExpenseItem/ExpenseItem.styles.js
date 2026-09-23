import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardDark,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  info: { flex: 1 },
  title: { color: colors.textDark, fontSize: 13.5, fontWeight: '700' },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  payerText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  payerHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  sub: {
    color: colors.textDim,
    fontSize: 10.5,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end' },
  amount: { color: colors.textDark, fontSize: 14, fontWeight: '800' },
  pill: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  pillText: { color: '#38BDF8', fontSize: 10, fontWeight: '700' },
});
