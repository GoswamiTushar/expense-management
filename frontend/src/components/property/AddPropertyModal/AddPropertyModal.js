import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAddPropertyStyles, styles as defaultStyles } from './AddPropertyModal.styles';
import { useTheme } from '../../../context/ThemeContext';
import OtaLinksField from './OtaLinksField';

export default function AddPropertyModal({ visible, onClose, onSubmit, currentUser }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createAddPropertyStyles(colors, isDark), [colors, isDark]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [otaLinks, setOtaLinks] = useState({});
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.9,
          stiffness: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = (callback) => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onClose();
      if (typeof callback === 'function') callback();
    });
  };

  if (!visible) return null;

  const handleCreate = async () => {
    if (!name.trim()) return alert('Enter a property name.');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), location: location.trim() || 'India', managers: [currentUser?._id].filter(Boolean), otaLinks });
      setName(''); setLocation(''); setOtaLinks({}); handleClose();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={true} transparent onRequestClose={() => handleClose()}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={() => handleClose()}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Airbnb Property</Text>
              <TouchableOpacity onPress={() => handleClose()}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>PROPERTY NAME</Text>
              <TextInput style={styles.input} placeholder="e.g. Mountain Haven Villa, Goa Retreat" placeholderTextColor={colors.textDim} value={name} onChangeText={setName} />
              <Text style={styles.label}>ADDRESS / CITY</Text>
              <TextInput style={styles.input} placeholder="e.g. Calangute, Goa, India" placeholderTextColor={colors.textDim} value={location} onChangeText={setLocation} />
              <OtaLinksField otaLinks={otaLinks} onChangeLinks={setOtaLinks} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Create Property</Text>}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
