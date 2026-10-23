import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPayerPickerStyles } from './PayerPickerField.styles';
import { useTheme } from '../../../context/ThemeContext';

export default function PayerPickerField({
  managers = [],
  managerDetails = [],
  currentUser,
  selectedPayerId,
  onSelectPayer,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createPayerPickerStyles(colors, isDark), [colors, isDark]);

  const currentUserId = String(currentUser?._id || currentUser?.id || '');

  // Build member list
  const members = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. Current user first
    if (currentUser) {
      list.push({
        id: currentUserId,
        name: currentUser.name || 'You',
        isMe: true,
      });
      seen.add(currentUserId);
    }

    // 2. Co-managers from managerDetails
    managerDetails.forEach((m) => {
      const mid = String(m.id || m._id || '');
      if (mid && !seen.has(mid)) {
        list.push({
          id: mid,
          name: m.name || 'Partner',
          isMe: mid === currentUserId,
        });
        seen.add(mid);
      }
    });

    // 3. Fallback for raw IDs in managers
    managers.forEach((m) => {
      const mid = String(m.id || m._id || m);
      if (mid && !seen.has(mid)) {
        list.push({
          id: mid,
          name: 'Partner',
          isMe: mid === currentUserId,
        });
        seen.add(mid);
      }
    });

    return list;
  }, [managers, managerDetails, currentUser, currentUserId]);

  const selectedMember = members.find((m) => m.id === selectedPayerId) || members[0];
  const isOnBehalf = selectedMember && !selectedMember.isMe;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PAID BY</Text>
      <View style={styles.chipList}>
        {members.map((member) => {
          const isSelected = member.id === (selectedPayerId || currentUserId);
          const initial = (member.name || 'M').charAt(0).toUpperCase();

          return (
            <TouchableOpacity
              key={member.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelectPayer(member.id, member.name)}
              activeOpacity={0.75}
            >
              <View style={[styles.avatar, isSelected && styles.avatarActive]}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {member.isMe ? 'You' : member.name}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.primary || '#6366F1'}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isOnBehalf && (
        <View style={styles.behalfNotice}>
          <Ionicons name="information-circle" size={15} color={isDark ? '#FBBF24' : '#B45309'} />
          <Text style={styles.behalfNoticeText}>
            Logging on behalf of {selectedMember.name} (credited as payer).
          </Text>
        </View>
      )}
    </View>
  );
}
