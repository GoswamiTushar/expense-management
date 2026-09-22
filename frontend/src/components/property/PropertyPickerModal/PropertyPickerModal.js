import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './PropertyPickerModal.styles';
import { colors } from '../../../theme/colors';

export default function PropertyPickerModal({ visible, onClose, properties = [], activeProperty, onSelectProperty, onOpenAddProperty, onOpenJoinInvite }) {
  if (!visible) return null;

  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Airbnb Properties</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {properties.map((prop) => {
              const active = prop._id === activeProperty?._id;
              return (
                <TouchableOpacity key={prop._id} style={[styles.item, active && styles.itemActive]} onPress={() => { onSelectProperty(prop); onClose(); }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, active && { color: colors.primary }]}>{prop.name}</Text>
                    <Text style={styles.loc}>{prop.location}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.addBtn} onPress={() => { onClose(); onOpenAddProperty(); }}>
            <Ionicons name="add-circle" size={17} color={colors.white} /><Text style={styles.addText}>+ Add New Property</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#0284C7', marginTop: 8 }]} onPress={() => { onClose(); onOpenJoinInvite?.(); }}>
            <Ionicons name="key" size={17} color={colors.white} /><Text style={styles.addText}>Join via Invite Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
