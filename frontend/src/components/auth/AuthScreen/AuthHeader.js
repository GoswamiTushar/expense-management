import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AuthScreen.styles';
import { colors } from '../../../theme/colors';

export default function AuthHeader({ isSignUp, setIsSignUp }) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.logo}><Ionicons name="home" size={24} color={colors.white} /></View>
        <Text style={styles.title}>Airbnb Property Hub</Text>
        <Text style={styles.sub}>{isSignUp ? 'Create your manager account' : 'Sign in to manage properties'}</Text>
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
