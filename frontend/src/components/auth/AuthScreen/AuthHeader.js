import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as defaultStyles } from './AuthScreen.styles';
import { colors } from '../../../theme/colors';

export default function AuthHeader({ isSignUp, setIsSignUp, styles = defaultStyles }) {
  return (
    <>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: 'transparent', overflow: 'hidden' }]}>
          <Image
            source={require('../../../../assets/icon.png')}
            style={{ width: 44, height: 44, borderRadius: 12 }}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>Ledger</Text>
        <Text style={styles.sub}>{isSignUp ? 'Create your account' : 'Split • Track • Settle shared expenses'}</Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, isSignUp && styles.tabActive]} onPress={() => setIsSignUp(true)}>
          <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, !isSignUp && styles.tabActive]} onPress={() => setIsSignUp(false)}>
          <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
