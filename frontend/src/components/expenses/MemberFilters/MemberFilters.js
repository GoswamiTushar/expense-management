import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

export default function MemberFilters({
  members = [],
  selectedMember = 'ALL',
  onSelectMember,
  expenseCountsByMember = {},
}) {
  const { colors: tColors, isDark } = useTheme();

  if (!members || members.length <= 1) {
    return null; // No need to filter if there's only 1 or 0 members
  }

  return (
    <View style={localStyles.wrapper}>
      <View style={localStyles.headerRow}>
        <Text style={[localStyles.filterLabel, { color: tColors.textMuted }]}>
          FILTER BY MEMBER
        </Text>
        {selectedMember !== 'ALL' && (
          <TouchableOpacity
            onPress={() => onSelectMember('ALL')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[localStyles.resetText, { color: tColors.primary }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={localStyles.scroll}
      >
        {/* All Members Chip */}
        <TouchableOpacity
          style={[
            localStyles.chip,
            {
              backgroundColor: isDark ? '#151821' : '#FFFFFF',
              borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
            },
            selectedMember === 'ALL' && [
              localStyles.chipActive,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
                borderColor: isDark ? '#FFFFFF' : '#0F172A',
              },
            ],
          ]}
          onPress={() => onSelectMember('ALL')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people"
            size={13}
            color={
              selectedMember === 'ALL'
                ? isDark
                  ? '#0C0E14'
                  : '#FFFFFF'
                : tColors.textMuted
            }
          />
          <Text
            style={[
              localStyles.chipText,
              { color: tColors.textMuted },
              selectedMember === 'ALL' && [
                localStyles.chipTextActive,
                { color: isDark ? '#0C0E14' : '#FFFFFF' },
              ],
            ]}
          >
            All Members
          </Text>
        </TouchableOpacity>

        {/* Member Chips */}
        {members.map((m) => {
          const isSelected = String(selectedMember) === String(m.id);
          const count = expenseCountsByMember[m.id] || 0;
          const initial = (m.name || 'M').charAt(0).toUpperCase();

          return (
            <TouchableOpacity
              key={m.id}
              style={[
                localStyles.chip,
                {
                  backgroundColor: isDark ? '#151821' : '#FFFFFF',
                  borderColor: isDark ? '#232838' : 'rgba(15, 23, 42, 0.08)',
                },
                isSelected && [
                  localStyles.chipActive,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#0F172A',
                    borderColor: isDark ? '#FFFFFF' : '#0F172A',
                  },
                ],
              ]}
              onPress={() => onSelectMember(isSelected ? 'ALL' : m.id)}
              activeOpacity={0.8}
            >
              {/* Mini Avatar Initial */}
              <View
                style={[
                  localStyles.miniAvatar,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#0C0E14'
                        : '#FFFFFF'
                      : isDark
                      ? '#232838'
                      : '#E2E8F0',
                  },
                ]}
              >
                <Text
                  style={[
                    localStyles.miniAvatarText,
                    {
                      color: isSelected
                        ? isDark
                          ? '#FFFFFF'
                          : '#0F172A'
                        : isDark
                        ? '#D1D5DB'
                        : '#475569',
                    },
                  ]}
                >
                  {initial}
                </Text>
              </View>

              <Text
                style={[
                  localStyles.chipText,
                  { color: tColors.textMuted },
                  isSelected && [
                    localStyles.chipTextActive,
                    { color: isDark ? '#0C0E14' : '#FFFFFF' },
                  ],
                ]}
              >
                {m.name || 'Member'}
              </Text>

              {count > 0 && (
                <View
                  style={[
                    localStyles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(12, 14, 20, 0.15)'
                          : 'rgba(255, 255, 255, 0.25)'
                        : isDark
                        ? '#1E2332'
                        : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      localStyles.countBadgeText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#0C0E14'
                            : '#FFFFFF'
                          : tColors.textDim,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          userSelect: 'none',
        }
      : {}),
  },
  chipActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  miniAvatar: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  chipTextActive: {
    fontWeight: '750',
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
