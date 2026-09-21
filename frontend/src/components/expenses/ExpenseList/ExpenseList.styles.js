import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
});
