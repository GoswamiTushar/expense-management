import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Animated, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createEditProfileStyles } from './EditProfileModal.styles';
import { useTheme } from '../../../context/ThemeContext';

export default function EditProfileModal({ visible, onClose, currentUser, onSaveProfile, onLogout }) {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const { theme, setTheme, isDark, colors: tColors } = useTheme();

  const styles = useMemo(() => createEditProfileStyles(tColors, isDark), [tColors, isDark]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible && currentUser) {
      setName(currentUser.name || '');
      setUpiId(currentUser.upiId || '');
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible, currentUser]);

  const handleClose = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
      if (typeof callback === 'function') callback();
    });
  };

  if (!visible) return null;

  const handleSave = () => {
    if (!name.trim()) return alert('Please enter your name.');
    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      upiId: upiId.trim(),
      initials: name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    });
    handleClose();
  };

  return (
    <Modal visible={true} transparent onRequestClose={() => handleClose()}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.grabber} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Profile & Settings</Text>
            <TouchableOpacity onPress={() => handleClose()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={tColors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Appearance Switcher (Light / Dark Mode) */}
          <View style={styles.appearanceSection}>
            <Text style={styles.label}>INTERFACE APPEARANCE</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, !isDark && styles.segmentBtnActive]}
                onPress={() => setTheme('light')}
                activeOpacity={0.8}
              >
                <Ionicons name={!isDark ? "sunny" : "sunny-outline"} size={16} color={!isDark ? tColors.primary : tColors.textMuted} />
                <Text style={[styles.segmentText, !isDark && styles.segmentTextActive]}>Light Mode</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, isDark && styles.segmentBtnActive]}
                onPress={() => setTheme('dark')}
                activeOpacity={0.8}
              >
                <Ionicons name={isDark ? "moon" : "moon-outline"} size={15} color={isDark ? tColors.primary : tColors.textMuted} />
                <Text style={[styles.segmentText, isDark && styles.segmentTextActive]}>Dark Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>YOUR FULL NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tushar Goswami"
            placeholderTextColor={tColors.textDim}
          />

          <Text style={styles.label}>YOUR UPI ID (FOR REIMBURSEMENTS)</Text>
          <TextInput
            style={styles.input}
            value={upiId}
            onChangeText={setUpiId}
            placeholder="e.g. yourname@okhdfcbank"
            placeholderTextColor={tColors.textDim}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.btnText}>Save Profile</Text>
          </TouchableOpacity>

          {onLogout && (
            <TouchableOpacity style={styles.logoutBtn} onPress={() => { handleClose(() => onLogout()); }}>
              <Text style={styles.logoutText}>Log Out of Account</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
