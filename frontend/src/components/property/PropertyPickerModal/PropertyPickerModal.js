import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Animated, Platform, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPropertyPickerStyles, styles as defaultStyles } from './PropertyPickerModal.styles';
import { useTheme } from '../../../context/ThemeContext';

export default function PropertyPickerModal({
  visible,
  onClose,
  properties = [],
  activeProperty,
  onSelectProperty,
  onOpenAddProperty,
  onOpenJoinInvite,
  onOpenInvitePartner,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createPropertyPickerStyles(colors, isDark), [colors, isDark]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
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
  }, [visible]);

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

  return (
    <Modal visible={true} transparent onRequestClose={() => handleClose()}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Airbnb Properties</Text>
            <TouchableOpacity onPress={() => handleClose()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {properties.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  No properties configured yet.
                </Text>
              </View>
            ) : (
              properties.map((prop) => {
                const active = prop._id === activeProperty?._id;
                return (
                  <TouchableOpacity
                    key={prop._id}
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => {
                      handleClose(() => onSelectProperty(prop));
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, active && { color: colors.primary }]}>
                        {prop.name}
                      </Text>
                      <Text style={styles.loc}>{prop.location}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.inviteBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleClose(() => onOpenInvitePartner?.(prop));
                        }}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="person-add-outline" size={13} color={colors.primary} />
                        <Text style={styles.inviteBtnText}>Invite</Text>
                      </TouchableOpacity>
                      {active && (
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              handleClose(() => onOpenAddProperty());
            }}
          >
            <Ionicons name="add-circle" size={17} color={colors.white} />
            <Text style={styles.addText}>+ Add New Property</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#0284C7', marginTop: 8 }]}
            onPress={() => {
              handleClose(() => onOpenJoinInvite?.());
            }}
          >
            <Ionicons name="key" size={17} color={colors.white} />
            <Text style={styles.addText}>Join via Invite Code</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
