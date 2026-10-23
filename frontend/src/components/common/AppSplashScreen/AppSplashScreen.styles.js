import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0C1325',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 36px rgba(99, 102, 241, 0.40), 0 0 20px rgba(6, 182, 212, 0.25)',
        }
      : {}),
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 26,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
    marginBottom: 28,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loaderText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
