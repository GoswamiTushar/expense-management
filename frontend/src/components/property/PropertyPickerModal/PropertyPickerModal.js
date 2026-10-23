import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPropertyPickerStyles } from './PropertyPickerModal.styles';
import { useTheme } from '../../../context/ThemeContext';

export default function PropertyPickerModal({
  visible,
  onClose,
  properties = [],
  activeProperty,
  onSelectProperty,
  onArchiveProperty,
  onOpenAddProperty,
  onOpenJoinInvite,
  onOpenInvitePartner,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createPropertyPickerStyles(colors, isDark), [colors, isDark]);

  const [currentTab, setCurrentTab] = useState('active'); // 'active' | 'archived'
  const [confirmTarget, setConfirmTarget] = useState(null); // { prop, shouldArchive }

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      setConfirmTarget(null);
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
    setConfirmTarget(null);
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

  const activeProps = useMemo(
    () => properties.filter((p) => !p.isArchived),
    [properties]
  );
  const archivedProps = useMemo(
    () => properties.filter((p) => Boolean(p.isArchived)),
    [properties]
  );

  const displayedProps = currentTab === 'active' ? activeProps : archivedProps;

  const handleToggleArchive = (prop, shouldArchive) => {
    setConfirmTarget({ prop, shouldArchive });
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
            <Text style={styles.title}>Switch Group</Text>
            <TouchableOpacity onPress={() => handleClose()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Segmented Active / Archived Tab Selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'active' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('active')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, currentTab === 'active' && styles.tabTextActive]}>
                Active
              </Text>
              <View style={[styles.tabBadge, currentTab === 'active' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, currentTab === 'active' && styles.tabBadgeTextActive]}>
                  {activeProps.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'archived' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('archived')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, currentTab === 'archived' && styles.tabTextActive]}>
                Archived
              </Text>
              <View style={[styles.tabBadge, currentTab === 'archived' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, currentTab === 'archived' && styles.tabBadgeTextActive]}>
                  {archivedProps.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
            {displayedProps.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Ionicons
                  name={currentTab === 'active' ? 'albums-outline' : 'archive-outline'}
                  size={32}
                  color={colors.textMuted}
                  style={{ marginBottom: 6, opacity: 0.6 }}
                />
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
                  {currentTab === 'active'
                    ? 'No active groups found.'
                    : 'No archived groups yet.\nPast trips or closed groups you archive appear here.'}
                </Text>
              </View>
            ) : (
              displayedProps.map((prop) => {
                const propId = prop._id || prop.id;
                const active = propId === (activeProperty?._id || activeProperty?.id);
                const isArchived = Boolean(prop.isArchived);

                return (
                  <View
                    key={propId}
                    style={[styles.item, active && styles.itemActive]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => {
                        handleClose(() => onSelectProperty(prop));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.name, active && { color: colors.primary }]}>
                        {prop.name}
                      </Text>
                      {prop.location ? (
                        <Text style={styles.loc}>{prop.location}</Text>
                      ) : null}
                      {isArchived && (
                        <View style={styles.archivedBadge}>
                          <Ionicons name="archive-outline" size={10} color="#FF9F0A" />
                          <Text style={styles.archivedBadgeText}>Archived</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {!isArchived ? (
                        <>
                          <TouchableOpacity
                            style={styles.inviteBtn}
                            onPress={() => {
                              handleClose(() => onOpenInvitePartner?.(prop));
                            }}
                            activeOpacity={0.75}
                          >
                            <Ionicons name="person-add-outline" size={13} color={colors.primary} />
                            <Text style={styles.inviteBtnText}>Invite</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => {
                              handleToggleArchive(prop, true);
                            }}
                            title="Archive group"
                            activeOpacity={0.7}
                          >
                            <Ionicons name="archive-outline" size={15} color={colors.textMuted} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.restoreBtn}
                          onPress={() => {
                            handleToggleArchive(prop, false);
                          }}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="refresh-outline" size={13} color="#34C759" />
                          <Text style={styles.restoreBtnText}>Restore</Text>
                        </TouchableOpacity>
                      )}

                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.primary}
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </View>
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
            <Text style={styles.addText}>+ Create New Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#0284C7', marginTop: 8 }]}
            onPress={() => {
              handleClose(() => onOpenJoinInvite?.());
            }}
          >
            <Ionicons name="key" size={17} color={colors.white} />
            <Text style={styles.addText}>Join with Invite Code</Text>
          </TouchableOpacity>

          {/* In-Card Custom Confirmation Modal */}
          {confirmTarget && (
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmBox}>
                <Ionicons
                  name={confirmTarget.shouldArchive ? 'archive-outline' : 'refresh-outline'}
                  size={32}
                  color={confirmTarget.shouldArchive ? '#FF9F0A' : '#34C759'}
                />
                <Text style={styles.confirmTitle}>
                  {confirmTarget.shouldArchive ? 'Archive Group?' : 'Restore Group?'}
                </Text>
                <Text style={styles.confirmSub}>
                  {confirmTarget.shouldArchive
                    ? `Archive "${confirmTarget.prop.name}"? It will be moved to the Archived tab with all balances preserved.`
                    : `Restore "${confirmTarget.prop.name}" back to your active groups list?`}
                </Text>
                <View style={styles.confirmBtnRow}>
                  <TouchableOpacity
                    style={styles.confirmCancelBtn}
                    onPress={() => setConfirmTarget(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmActionBtn,
                      { backgroundColor: confirmTarget.shouldArchive ? '#FF9F0A' : '#34C759' },
                    ]}
                    onPress={async () => {
                      const { prop, shouldArchive } = confirmTarget;
                      setConfirmTarget(null);
                      try {
                        if (onArchiveProperty) {
                          await onArchiveProperty(prop._id || prop.id, shouldArchive);
                        }
                      } catch (err) {
                        console.error('Failed to toggle archive:', err);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmActionText}>
                      {confirmTarget.shouldArchive ? 'Archive' : 'Restore'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
