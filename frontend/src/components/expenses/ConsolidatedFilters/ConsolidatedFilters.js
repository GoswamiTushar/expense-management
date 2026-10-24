import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createConsolidatedFilterStyles } from './ConsolidatedFilters.styles';
import { useTheme } from '../../../context/ThemeContext';
import { categories } from '../../../theme/categories';
import { feedback } from '../../../services/feedback/feedbackService';

// Extracts YYYY-MM from an expense
export const getExpenseMonthKey = (e) => {
  const d = e.date || e.createdAt;
  if (!d) return '';
  if (/^\d{4}-\d{2}/.test(d)) {
    return d.substring(0, 7);
  }
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return '';
};

// Generates months starting from group creation month to current month in reverse chronological order
const generateGroupMonths = (activeProperty, expenses = []) => {
  const months = [{ id: 'ALL', label: 'All Time', shortLabel: 'All Months' }];

  let startDate = null;
  if (activeProperty?.createdAt) {
    startDate = new Date(activeProperty.createdAt);
  } else if (activeProperty?._id?.startsWith('prop_')) {
    const ms = parseInt(activeProperty._id.split('_')[1], 10);
    if (!isNaN(ms)) startDate = new Date(ms);
  }

  // Fallback to oldest expense date if property creation timestamp is missing
  if (!startDate || isNaN(startDate.getTime())) {
    if (expenses.length > 0) {
      const dates = expenses
        .map((e) => new Date(e.date || e.createdAt))
        .filter((d) => !isNaN(d.getTime()));
      if (dates.length > 0) {
        startDate = new Date(Math.min(...dates));
      }
    }
  }

  const now = new Date();
  if (!startDate || isNaN(startDate.getTime()) || startDate > now) {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  }

  let currYear = now.getFullYear();
  let currMonth = now.getMonth(); // 0-indexed

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const shortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Loop backwards from current month down to start month
  while (
    currYear > startYear ||
    (currYear === startYear && currMonth >= startMonth)
  ) {
    const id = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;
    const label = `${monthNames[currMonth]} ${currYear}`;
    const shortLabel = `${shortNames[currMonth]} ${currYear}`;

    months.push({ id, label, shortLabel, year: currYear, month: currMonth });

    currMonth--;
    if (currMonth < 0) {
      currMonth = 11;
      currYear--;
    }
  }

  return months;
};

export default function ConsolidatedFilters({
  selectedMonth = 'ALL',
  onSelectMonth,
  selectedMember = 'ALL',
  onSelectMember,
  selectedCategory = 'ALL',
  onSelectCategory,
  members = [],
  expenseCountsByMember = {},
  activeProperty,
  expenses = [],
  onClearAll,
}) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createConsolidatedFilterStyles(tColors, isDark), [tColors, isDark]);

  const [activeSheet, setActiveSheet] = useState(null); // 'MONTH' | 'MEMBER' | 'CATEGORY' | null
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const months = useMemo(
    () => generateGroupMonths(activeProperty, expenses),
    [activeProperty, expenses]
  );

  // Month expense counts
  const expenseCountsByMonth = useMemo(() => {
    const counts = {};
    (expenses || []).forEach((e) => {
      if (e.isDeleted || e.deleted === 'Y' || e.isDeleted === 'Y') return;
      const key = getExpenseMonthKey(e);
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [expenses]);

  // Category expense counts
  const expenseCountsByCategory = useMemo(() => {
    const counts = {};
    (expenses || []).forEach((e) => {
      if (e.isDeleted || e.deleted === 'Y' || e.isDeleted === 'Y') return;
      const cat = e.category;
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [expenses]);

  const openSheet = (sheetType) => {
    feedback.drawer();
    setActiveSheet(sheetType);
    slideAnim.setValue(400);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 26,
        mass: 0.8,
        stiffness: 280,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const closeSheet = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setActiveSheet(null);
      if (typeof callback === 'function') callback();
    });
  };

  // Find active labels
  const activeMonthObj = months.find((m) => m.id === selectedMonth);
  const activeMemberObj = members.find((m) => String(m.id) === String(selectedMember));
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  const isMonthFiltered = selectedMonth !== 'ALL';
  const isMemberFiltered = selectedMember !== 'ALL';
  const isCategoryFiltered = selectedCategory !== 'ALL';

  const activeFilterCount =
    (isMonthFiltered ? 1 : 0) + (isMemberFiltered ? 1 : 0) + (isCategoryFiltered ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.pillsRow}>
        {/* 1. Month Dropdown Pill */}
        <TouchableOpacity
          style={[styles.pill, isMonthFiltered && styles.pillActive]}
          onPress={() => openSheet('MONTH')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="calendar-outline"
            size={13}
            color={isMonthFiltered ? (isDark ? '#C7D2FE' : '#4338CA') : tColors.textMuted}
          />
          <Text style={[styles.pillText, isMonthFiltered && styles.pillTextActive]} numberOfLines={1}>
            {isMonthFiltered ? activeMonthObj?.shortLabel || selectedMonth : 'Month'}
          </Text>
          {isMonthFiltered ? (
            <TouchableOpacity
              style={styles.pillCloseBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                feedback.pop();
                onSelectMonth('ALL');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={14} color={isDark ? '#C7D2FE' : '#4338CA'} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={11} color={tColors.textDim} />
          )}
        </TouchableOpacity>

        {/* 2. Member Dropdown Pill */}
        <TouchableOpacity
          style={[styles.pill, isMemberFiltered && styles.pillActive]}
          onPress={() => openSheet('MEMBER')}
          activeOpacity={0.75}
        >
          <Ionicons
            name="people-outline"
            size={13.5}
            color={isMemberFiltered ? (isDark ? '#C7D2FE' : '#4338CA') : tColors.textMuted}
          />
          <Text style={[styles.pillText, isMemberFiltered && styles.pillTextActive]} numberOfLines={1}>
            {isMemberFiltered ? activeMemberObj?.name || 'Member' : 'Member'}
          </Text>
          {isMemberFiltered ? (
            <TouchableOpacity
              style={styles.pillCloseBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                feedback.pop();
                onSelectMember('ALL');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={14} color={isDark ? '#C7D2FE' : '#4338CA'} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={11} color={tColors.textDim} />
          )}
        </TouchableOpacity>

        {/* 3. Category Dropdown Pill */}
        <TouchableOpacity
          style={[styles.pill, isCategoryFiltered && styles.pillActive]}
          onPress={() => openSheet('CATEGORY')}
          activeOpacity={0.75}
        >
          <Ionicons
            name={activeCategoryObj ? activeCategoryObj.icon : 'pricetag-outline'}
            size={13}
            color={isCategoryFiltered ? (isDark ? '#C7D2FE' : '#4338CA') : tColors.textMuted}
          />
          <Text style={[styles.pillText, isCategoryFiltered && styles.pillTextActive]} numberOfLines={1}>
            {isCategoryFiltered ? activeCategoryObj?.label || 'Category' : 'Category'}
          </Text>
          {isCategoryFiltered ? (
            <TouchableOpacity
              style={styles.pillCloseBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                feedback.pop();
                onSelectCategory('ALL');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={14} color={isDark ? '#C7D2FE' : '#4338CA'} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={11} color={tColors.textDim} />
          )}
        </TouchableOpacity>
      </View>

      {/* Dynamic Selector Bottom Sheet */}
      <Modal visible={Boolean(activeSheet)} transparent onRequestClose={() => closeSheet()}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={() => closeSheet()}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.dragHandle} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Ionicons
                  name={
                    activeSheet === 'MONTH'
                      ? 'calendar'
                      : activeSheet === 'MEMBER'
                      ? 'people'
                      : 'pricetags'
                  }
                  size={17}
                  color={tColors.primary}
                />
                <Text style={styles.sheetTitle}>
                  {activeSheet === 'MONTH' && 'Filter by Month'}
                  {activeSheet === 'MEMBER' && 'Filter by Member'}
                  {activeSheet === 'CATEGORY' && 'Filter by Category'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => closeSheet()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={tColors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* List of Options */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* MONTH OPTIONS */}
              {activeSheet === 'MONTH' && (
                <>
                  {months.map((m) => {
                    const isSelected = selectedMonth === m.id;
                    const count = m.id === 'ALL' ? expenses.length : expenseCountsByMonth[m.id] || 0;

                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.sheetItem, isSelected && styles.sheetItemActive]}
                        onPress={() => {
                          feedback.pop();
                          onSelectMonth(m.id);
                          closeSheet();
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.sheetItemLeft}>
                          <View style={styles.sheetItemIcon}>
                            <Ionicons
                              name="calendar-outline"
                              size={15}
                              color={isSelected ? tColors.primary : tColors.textMuted}
                            />
                          </View>
                          <Text style={[styles.sheetItemLabel, isSelected && styles.sheetItemLabelActive]}>
                            {m.label}
                          </Text>
                        </View>
                        <View style={styles.sheetItemMeta}>
                          <Text style={styles.sheetItemCount}>
                            {count} {count === 1 ? 'expense' : 'expenses'}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={tColors.primary} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* MEMBER OPTIONS */}
              {activeSheet === 'MEMBER' && (
                <>
                  <TouchableOpacity
                    style={[styles.sheetItem, selectedMember === 'ALL' && styles.sheetItemActive]}
                    onPress={() => {
                      feedback.pop();
                      onSelectMember('ALL');
                      closeSheet();
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.sheetItemLeft}>
                      <View style={styles.sheetItemIcon}>
                        <Ionicons
                          name="people"
                          size={15}
                          color={selectedMember === 'ALL' ? tColors.primary : tColors.textMuted}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sheetItemLabel,
                          selectedMember === 'ALL' && styles.sheetItemLabelActive,
                        ]}
                      >
                        All Members
                      </Text>
                    </View>
                    <View style={styles.sheetItemMeta}>
                      <Text style={styles.sheetItemCount}>{expenses.length} expenses</Text>
                      {selectedMember === 'ALL' && (
                        <Ionicons name="checkmark-circle" size={18} color={tColors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {members.map((m) => {
                    const isSelected = String(selectedMember) === String(m.id);
                    const count = expenseCountsByMember[m.id] || 0;

                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.sheetItem, isSelected && styles.sheetItemActive]}
                        onPress={() => {
                          feedback.pop();
                          onSelectMember(m.id);
                          closeSheet();
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.sheetItemLeft}>
                          <View style={styles.sheetItemIcon}>
                            <Ionicons
                              name="person"
                              size={14}
                              color={isSelected ? tColors.primary : tColors.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.sheetItemLabel,
                              isSelected && styles.sheetItemLabelActive,
                            ]}
                          >
                            {m.name} {m.isMe ? '(You)' : ''}
                          </Text>
                        </View>
                        <View style={styles.sheetItemMeta}>
                          <Text style={styles.sheetItemCount}>
                            {count} {count === 1 ? 'expense' : 'expenses'}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={tColors.primary} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* CATEGORY OPTIONS */}
              {activeSheet === 'CATEGORY' && (
                <>
                  <TouchableOpacity
                    style={[styles.sheetItem, selectedCategory === 'ALL' && styles.sheetItemActive]}
                    onPress={() => {
                      feedback.pop();
                      onSelectCategory('ALL');
                      closeSheet();
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.sheetItemLeft}>
                      <View style={styles.sheetItemIcon}>
                        <Ionicons
                          name="grid-outline"
                          size={15}
                          color={selectedCategory === 'ALL' ? tColors.primary : tColors.textMuted}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sheetItemLabel,
                          selectedCategory === 'ALL' && styles.sheetItemLabelActive,
                        ]}
                      >
                        All Categories
                      </Text>
                    </View>
                    <View style={styles.sheetItemMeta}>
                      <Text style={styles.sheetItemCount}>{expenses.length} expenses</Text>
                      {selectedCategory === 'ALL' && (
                        <Ionicons name="checkmark-circle" size={18} color={tColors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count = expenseCountsByCategory[cat.id] || 0;

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.sheetItem, isSelected && styles.sheetItemActive]}
                        onPress={() => {
                          feedback.pop();
                          onSelectCategory(cat.id);
                          closeSheet();
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.sheetItemLeft}>
                          <View style={styles.sheetItemIcon}>
                            <Ionicons
                              name={cat.icon}
                              size={15}
                              color={isSelected ? tColors.primary : tColors.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.sheetItemLabel,
                              isSelected && styles.sheetItemLabelActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </View>
                        <View style={styles.sheetItemMeta}>
                          <Text style={styles.sheetItemCount}>
                            {count} {count === 1 ? 'expense' : 'expenses'}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={tColors.primary} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}
