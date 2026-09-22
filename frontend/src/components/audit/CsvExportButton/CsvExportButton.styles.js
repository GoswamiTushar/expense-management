import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 4,
  },
  text: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '700',
  },
});
