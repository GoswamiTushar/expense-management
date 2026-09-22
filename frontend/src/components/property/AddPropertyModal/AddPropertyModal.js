import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AddPropertyModal.styles';
import { colors } from '../../../theme/colors';
import OtaLinksField from './OtaLinksField';

export default function AddPropertyModal({ visible, onClose, onSubmit, currentUser }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [otaLinks, setOtaLinks] = useState({});
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleCreate = async () => {
    if (!name.trim()) return alert('Enter a property name.');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), location: location.trim() || 'India', managers: [currentUser?._id].filter(Boolean), otaLinks });
      setName(''); setLocation(''); setOtaLinks({}); onClose();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Airbnb Property</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
