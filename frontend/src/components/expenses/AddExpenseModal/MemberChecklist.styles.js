import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 6,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.textDark,
    fontSize: 12.5,
    fontWeight: '600',
  },
  share: {
    color: colors.success,
    fontSize: 12.5,
    fontWeight: '700',
  },
  excluded: {
    color: colors.textDim,
    fontSize: 11.5,
  },
});
