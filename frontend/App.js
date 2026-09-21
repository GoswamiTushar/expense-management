import React, { useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { styles } from './src/styles/app.styles';
import { usePropertyData } from './src/hooks/usePropertyData';
import { logoutUser } from './src/services/api/authApi';
import Toast from './src/components/common/Toast/Toast';
import AuthScreen from './src/components/auth/AuthScreen/AuthScreen';
import MainDashboard from './src/components/dashboard/MainDashboard';
import { AcceptInviteModal } from './src/components/auth/AcceptInviteModal/AcceptInviteModal';

export default function App() {
  const data = usePropertyData();
  const [showAcceptInvite, setShowAcceptInvite] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    data.setCurrentUser(null);
  };

  const handleInviteJoined = (res) => {
    data.setCurrentUser(res.user);
    data.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Toast />
      {!data.currentUser ? (
        <>
          <AuthScreen
            onAuthSuccess={data.setCurrentUser}
            onOpenInviteCode={() => setShowAcceptInvite(true)}
          />
          <AcceptInviteModal
            visible={showAcceptInvite}
            onClose={() => setShowAcceptInvite(false)}
            onSuccess={handleInviteJoined}
          />
        </>
      ) : (
        <MainDashboard data={data} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  );
}
