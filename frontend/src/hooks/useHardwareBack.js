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
  const activeModalRef = useRef(activeModal);
  const activeTabRef = useRef(activeTab);

  activeModalRef.current = activeModal;
  activeTabRef.current = activeTab;

  // 1. Android Native Back Button Handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // Priority 1: Close active modal/drawer
      if (activeModalRef.current) {
        onCloseModal?.();
        return true;
      }

      // Priority 2: Return from sub-tab to Home
      if (activeTabRef.current !== 'home') {
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
  }, [onCloseModal, onSelectTab]);

  // 2. Web / PWA Browser & Gesture Back Navigation Trap
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Ensure initial sentinel state is present so PWA doesn't immediately close on back swipe
    if (!window.history.state || !window.history.state.ledgerHome) {
      window.history.replaceState({ ledgerRoot: true }, '');
      window.history.pushState({ ledgerHome: true }, '');
    }

    const handlePopState = () => {
      // Priority 1: Close active modal/drawer
      if (activeModalRef.current) {
        onCloseModal?.();
        return;
      }

      // Priority 2: Return from sub-tab to Home
      if (activeTabRef.current !== 'home') {
        onSelectTab?.('home');
        // Keep a history buffer
        window.history.pushState({ ledgerHome: true }, '');
        return;
      }

      // Priority 3: Root screen double-back within 2s to exit
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        // Double-back confirmed within 2 seconds: allow PWA/browser to exit
        if (window.history.length > 1) {
          window.history.back();
        }
        return;
      }

      // First back press on Home: trap and ask user to press back again
      lastBackPress.current = now;
      toastEmitter.emit('Press Back Again', 'Tap back again to exit Ledger.', 'info');
      window.history.pushState({ ledgerHome: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onCloseModal, onSelectTab]);

  // Sync modal and tab pushes to browser history so swipe-back dismisses them first
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (activeModal) {
      window.history.pushState({ ledgerModal: true }, '');
    }
  }, [activeModal]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (activeTab !== 'home') {
      window.history.pushState({ ledgerTab: activeTab }, '');
    }
  }, [activeTab]);
};

