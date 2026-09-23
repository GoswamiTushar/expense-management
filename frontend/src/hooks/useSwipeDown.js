import { useRef } from 'react';
import { PanResponder, Animated } from 'react-native';

/**
 * useSwipeDown — attaches a PanResponder to a bottom-sheet Animated.Value
 * so the user can swipe the sheet down to dismiss it.
 *
 * @param {Animated.Value} slideAnim   - The translateY value driving the sheet position
 * @param {Function}       onClose     - Callback that fully closes the sheet (with exit animation)
 * @param {boolean}        disabled    - When true (e.g. while submitting) swipe is blocked
 * @returns panHandlers to spread onto the drag-pill / header View
 */
export const useSwipeDown = (slideAnim, onClose, disabled = false) => {
  const dragStart = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture if user is moving downward
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        if (disabled) return false;
        return dy > 8 && Math.abs(dy) > Math.abs(dx);
      },
      onPanResponderGrant: () => {
        // Record the current position as baseline
        dragStart.current = 0;
        slideAnim.setOffset(slideAnim.__getValue ? slideAnim.__getValue() : 0);
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, { dy }) => {
        if (dy < 0) return; // ignore upward drags
        slideAnim.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        slideAnim.flattenOffset();
        // If dragged far enough or flicked fast → close
        if (dy > 80 || vy > 0.5) {
          onClose();
        } else {
          // Snap back to open position
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 26,
            mass: 0.9,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: (_, { dy }) => {
        slideAnim.flattenOffset();
        if (dy > 80) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 26,
            mass: 0.9,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
};
