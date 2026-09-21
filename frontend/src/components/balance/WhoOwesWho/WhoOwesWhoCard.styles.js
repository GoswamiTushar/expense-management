import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    color: colors.textDark,
    fontSize: 13.5,
    fontWeight: '700',
  },
  settledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  settledTitle: {
    color: colors.success,
    fontSize: 13.5,
    fontWeight: '700',
  },
  settledSub: {
    color: colors.textMuted,
    fontSize: 11.5,
  },
  list: {
    gap: 8,
  },
});
