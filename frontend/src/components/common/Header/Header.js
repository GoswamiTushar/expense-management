import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Header.styles';
import { colors } from '../../../theme/colors';
import Avatar from '../Avatar/Avatar';

export default function Header({
  activeProperty, currentUser, unreadCount = 0,
  onOpenPropertyPicker, onOpenNotifications, onOpenAuditLog, onOpenProfile, onOpenInvitePartner,
}) {
  const propTitle = activeProperty ? `${activeProperty.name} • ${activeProperty.location || 'Properties'}` : 'Select or Add Property';
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandBox}>
          <View style={styles.brandIcon}><Ionicons name="home" size={17} color={colors.white} /></View>
          <View>
            <Text style={styles.brandTitle}>Airbnb Manager</Text>
            <Text style={styles.brandSub}>Expense & Settlement Hub</Text>
          </View>
        </View>
        <View style={styles.actionGroup}>
          {activeProperty && (
            <TouchableOpacity style={styles.iconBtn} onPress={onOpenInvitePartner}>
              <Ionicons name="person-add-outline" size={18} color={colors.textDark} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenAuditLog}>
            <Ionicons name="receipt-outline" size={18} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenNotifications}>
            <Ionicons name="notifications-outline" size={18} color={colors.textDark} />
            {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenProfile} activeOpacity={0.7}>
            <Avatar name={currentUser?.name} initials={currentUser?.initials} color={currentUser?.color} size={34} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.propertyBar} onPress={onOpenPropertyPicker} activeOpacity={0.8}>
        <Ionicons name="location" size={15} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.propText} numberOfLines={1}>{propTitle}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}
