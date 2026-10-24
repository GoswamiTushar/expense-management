import { useRef } from 'react';
import { PanResponder, Animated, Platform } from 'react-native';

/**
 * useSwipeDown — attaches a fluid PanResponder to a bottom-sheet Animated.Value
 * so the user can swipe down anywhere on the sheet (handle, header, body, or bottom)
 * to dismiss it, feeling like a real iOS / Android bottom sheet.
 *
 * @param {Animated.Value} slideAnim   - The translateY value driving the sheet position
 * @param {Function}       onClose     - Callback that fully closes the sheet (with exit animation)
 * @param {boolean|Object} options     - Boolean `disabled` or options `{ disabled, isAtTop }`
 * @returns panHandlers to spread onto the sheet container and drag handle
 */
export const useSwipeDown = (slideAnim, onClose, options = {}) => {
  const isOptionsObj = options && typeof options === 'object';
  const disabled = isOptionsObj ? Boolean(options.disabled) : Boolean(options);
  const isAtTop = isOptionsObj ? options.isAtTop : null;

  const dragStart = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      // Claim the gesture if user is swiping down and is at the top of content
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        if (disabled) return false;
        if (isAtTop && typeof isAtTop === 'function' && !isAtTop()) {
          return false;
        }
        return dy > 6 && Math.abs(dy) > Math.abs(dx) * 1.1;
      },

      onMoveShouldSetPanResponderCapture: (_, { dy, dx }) => {
        if (disabled) return false;
        if (isAtTop && typeof isAtTop === 'function' && !isAtTop()) {
          return false;
        }
        return dy > 10 && Math.abs(dy) > Math.abs(dx) * 1.4;
      },

      onPanResponderGrant: () => {
        dragStart.current = 0;
        slideAnim.setOffset(slideAnim.__getValue ? slideAnim.__getValue() : 0);
        slideAnim.setValue(0);
      },

      onPanResponderMove: (_, { dy }) => {
        if (dy < 0) return; // Ignore upward drags
        slideAnim.setValue(dy);
      },

      onPanResponderRelease: (_, { dy, vy }) => {
        slideAnim.flattenOffset();
        // If dragged down > 55px or flicked with velocity > 0.30 → dismiss
        if (dy > 55 || vy > 0.30) {
          onClose();
        } else {
          // Native-feel, fluid spring physics back to open position
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 26,
            mass: 0.8,
            stiffness: 280,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },

      onPanResponderTerminate: (_, { dy }) => {
        slideAnim.flattenOffset();
        if (dy > 55) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 26,
            mass: 0.8,
            stiffness: 280,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },

    })
  ).current;

  return panResponder.panHandlers;
};
