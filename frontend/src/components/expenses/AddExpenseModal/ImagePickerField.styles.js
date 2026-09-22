import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';

const THUMB_SIZE = 90;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { marginVertical: 8 },

  labelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
  },
  label: {
    color: colors.textMuted, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: colors.primary + '22', color: colors.primary,
    fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, overflow: 'hidden',
  },

  // ── Thumbnail strip ────────────────────────────────────────────────────────
  previewScroll: { marginBottom: 8 },
  previewRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingHorizontal: 2 },

  thumbWrapper: {
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: 10, overflow: 'visible',
    position: 'relative',
  },
  thumb: {
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.borderDark,
  },
  tapHint: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: 2,
  },
  thumbIndexBadge: {
    position: 'absolute', top: -5, left: -5,
    backgroundColor: colors.primary, borderRadius: 10,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  thumbIndexText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  removeBtn: {
    position: 'absolute', top: -8, right: -8,
    backgroundColor: '#1a1a2e', borderRadius: 12,
  },

  // ── Add buttons ────────────────────────────────────────────────────────────
  btnRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceDark, borderRadius: 10, paddingVertical: 9,
    borderWidth: 1, borderColor: colors.borderDark, gap: 6,
  },
  btnText: { color: colors.textDark, fontSize: 12, fontWeight: '600' },

  // ── Lightbox ───────────────────────────────────────────────────────────────
  lightboxOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  lightboxImage: {
    width: SCREEN_W, height: SCREEN_H * 0.78,
  },
  lightboxClose: {
    position: 'absolute', top: 52, right: 18,
  },
  lightboxHint: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 12,
  },
});
