import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './src/styles/app.styles';
import { colors } from './src/theme/colors';
import { usePropertyData } from './src/hooks/usePropertyData';
import { logoutUser } from './src/services/api/authApi';
import { getDeviceUserProfile } from './src/services/storage/sessionStore';
import Toast from './src/components/common/Toast/Toast';
import GlobalApiLoader from './src/components/common/GlobalApiLoader/GlobalApiLoader';
import AuthScreen from './src/components/auth/AuthScreen/AuthScreen';
import MainDashboard from './src/components/dashboard/MainDashboard';
import { AcceptInviteModal } from './src/components/auth/AcceptInviteModal/AcceptInviteModal';
import { registerForPushNotifications } from './src/services/notifications/pushService';

const getParams = () => {
  if (typeof window !== 'undefined' && window.location?.search) {
    const p = new URLSearchParams(window.location.search);
    return { invite: p.get('invite') || '', otp: p.get('otp') || '', email: p.get('verify_email') || '' };
  }
  return { invite: '', otp: '', email: '' };
};

export default function App() {
  // Auth state lives here — single source of truth
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true while checking stored session
  const [params] = useState(getParams);
  const [showAcceptInvite, setShowAcceptInvite] = useState(Boolean(params.invite));

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

  // Show a minimal loading state while we read the keychain
  if (authLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary || '#FF385C'} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surfaceDark} />
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
        ) : (
          <MainDashboard
            data={{ ...data, currentUser, setCurrentUser }}
            onLogout={handleLogout}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
