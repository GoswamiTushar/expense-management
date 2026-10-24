import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { toastEmitter } from '../services/notifications/toastEmitter';

/**
 * useHardwareBack — native Android & PWA gesture back button handler.
 * Prevents unintended app exits by closing active modals and sub-tabs first,
 * and requires double-tap back at the root to exit.
 */
export const useHardwareBack = ({
  activeModal,
  onCloseModal,
  activeTab = 'home',
  onSelectTab,
}) => {
  const lastBackPress = useRef(0);
  const pushedStateRef = useRef(false);

  // 1. Android Native Back Button Handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // Priority 1: Close active modal/drawer
      if (activeModal) {
        onCloseModal?.();
        return true;
      }

      // Priority 2: Return from sub-tab to Home
      if (activeTab !== 'home') {
        onSelectTab?.('home');
        return true;
      }

      // Priority 3: Root screen double-tap back within 2s to exit
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        return false; // Allow native OS to exit app
      }

      lastBackPress.current = now;
      toastEmitter.emit('Press Back Again', 'Tap back again to exit Ledger.', 'info');
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeModal, onCloseModal, activeTab, onSelectTab]);

  // 2. Web / PWA Browser & Gesture Back Navigation Sync
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (activeModal) {
      // Push history state so Android gesture or browser back dismisses the modal
      window.history.pushState({ modalOpen: true }, '');
      pushedStateRef.current = true;
    }

    const handlePopState = (event) => {
      if (activeModal) {
        onCloseModal?.();
      } else if (activeTab !== 'home') {
        onSelectTab?.('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeModal, onCloseModal, activeTab, onSelectTab]);
};
