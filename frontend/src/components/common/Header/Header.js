import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createHeaderStyles } from './Header.styles';
import { useTheme } from '../../../context/ThemeContext';
import Avatar from '../Avatar/Avatar';

export default function Header({
  activeProperty,
  currentUser,
  unreadCount = 0,
  onOpenPropertyPicker,
  onOpenNotifications,
  onOpenAuditLog,
  onOpenProfile,
  onOpenInvitePartner,
  // Dynamic navigation props
  title,
  subtitle,
  onBack,
  headerRightAction,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createHeaderStyles(tColors, isDark), [tColors, isDark]);

  const propTitle = activeProperty
    ? `${activeProperty.name} • ${activeProperty.location || 'Properties'}`
    : 'Select or Add Property';

  const isSubPage = Boolean(onBack);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {isSubPage ? (
          <>
            {/* 1. Dynamic Left Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityLabel="Back to Home"
            >
              <Ionicons name="chevron-back" size={20} color={tColors.textDark} />
            </TouchableOpacity>

            {/* 2. Centered Page Name & Subtitle */}
            <View style={styles.centerTitleBox}>
              <Text style={styles.centerTitle} numberOfLines={1}>
                {title || 'Settlements Hub'}
              </Text>
              {Boolean(subtitle || activeProperty?.name) && (
                <Text style={styles.centerSub} numberOfLines={1}>
                  {subtitle || activeProperty?.name}
                </Text>
              )}
            </View>
          </>
        ) : (
          /* Default Home Brand Box */
          <View style={styles.brandBox}>
            <View style={styles.brandIcon}>
              <Ionicons name="home" size={16} color={tColors.white} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Airbnb Manager</Text>
              <Text style={styles.brandSub}>Expense & Settlement Hub</Text>
            </View>
          </View>
        )}

        {/* Right Action Group */}
        <View style={styles.actionGroup}>
          {headerRightAction}

          <TouchableOpacity style={styles.iconBtn} onPress={onOpenNotifications}>
            <Ionicons name="notifications-outline" size={15} color={tColors.textDark} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenProfile} activeOpacity={0.7}>
            <Avatar
              name={currentUser?.name}
              initials={currentUser?.initials}
              color={currentUser?.color}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Property Bar (only on main home screen) */}
      {!isSubPage && (
        <TouchableOpacity
          style={styles.propertyBar}
          onPress={onOpenPropertyPicker}
          activeOpacity={0.8}
        >
          <Ionicons name="location" size={14} color={tColors.primary} style={{ marginRight: 7 }} />
          <Text style={styles.propText} numberOfLines={1}>
            {propTitle}
          </Text>
          <Ionicons name="chevron-down" size={13} color={tColors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}
