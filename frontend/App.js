import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, Image, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './src/styles/app.styles';
import { colors } from './src/theme/colors';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { usePropertyData } from './src/hooks/usePropertyData';
import { logoutUser } from './src/services/api/authApi';
import { getDeviceUserProfile } from './src/services/storage/sessionStore';
import Toast from './src/components/common/Toast/Toast';
import GlobalApiLoader from './src/components/common/GlobalApiLoader/GlobalApiLoader';
import AuthScreen from './src/components/auth/AuthScreen/AuthScreen';
import MainDashboard from './src/components/dashboard/MainDashboard';
import AdminDashboard from './src/components/admin/AdminDashboard/AdminDashboard';
import { AcceptInviteModal } from './src/components/auth/AcceptInviteModal/AcceptInviteModal';
import { registerForPushNotifications } from './src/services/notifications/pushService';
import AppSplashScreen from './src/components/common/AppSplashScreen/AppSplashScreen';

import { FAVICON_DATA_URI } from './src/utils/faviconBase64';

const getParams = () => {
  if (typeof window !== 'undefined' && window.location?.search) {
    const p = new URLSearchParams(window.location.search);
    return { invite: p.get('invite') || '', otp: p.get('otp') || '', email: p.get('verify_email') || '' };
  }
  return { invite: '', otp: '', email: '' };
};

function AppContent() {
  const { colors: tColors, isDark } = useTheme();

  // Auth state lives here — single source of truth
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true while checking stored session
  const [splashFinished, setSplashFinished] = useState(false);
  const [params] = useState(getParams);
  const [showAcceptInvite, setShowAcceptInvite] = useState(Boolean(params.invite));

  // Set web page title & favicon dynamically for website use
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'SplitLedger | Shared Expenses & Settlements';
      try {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.type = 'image/png';
        link.href = '/favicon.png';
      } catch (_) {}
    }
  }, []);

  // Check for a persisted session on app start (before rendering anything)
  useEffect(() => {
    (async () => {
      const stored = await getDeviceUserProfile();
      if (stored) {
        // Ensure _id is always set (maps from id field returned by backend)
        setCurrentUser({ ...stored, _id: stored._id || stored.id, id: stored.id || stored._id });
        // Re-register push token on every app start (token can change)
        registerForPushNotifications().catch(() => {});
      }
      setAuthLoading(false);
    })();
  }, []);

  // Data hook — only fetches when currentUser is non-null
  const data = usePropertyData(currentUser);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    // Register for push notifications on login (async, non-blocking)
    registerForPushNotifications().catch(() => {});
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const handleInviteJoined = (res) => {
    setCurrentUser(res.user);
    data.reload();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tColors.bgDark }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? tColors.surfaceDark : tColors.bgDark}
      />
      <GlobalApiLoader />
      <Toast />
      {!currentUser ? (
        <>
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            onOpenInviteCode={() => setShowAcceptInvite(true)}
            initialOtp={params.otp}
            initialEmail={params.email}
          />
          <AcceptInviteModal
            visible={showAcceptInvite}
            onClose={() => setShowAcceptInvite(false)}
            onSuccess={handleInviteJoined}
            initialCode={params.invite}
          />
        </>
      ) : currentUser?.role === 'admin' ? (
        <AdminDashboard
          onLogout={handleLogout}
        />
      ) : (
        <MainDashboard
          data={{ ...data, currentUser, setCurrentUser }}
          onLogout={handleLogout}
        />
      )}
      {!splashFinished && (
        <AppSplashScreen
          isReady={!authLoading}
          onAnimationComplete={() => setSplashFinished(true)}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
