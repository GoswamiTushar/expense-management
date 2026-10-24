import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCategoryFilterStyles } from './CategoryFilters.styles';
import { useTheme } from '../../../context/ThemeContext';
import { categories } from '../../../theme/categories';
import { feedback } from '../../../services/feedback/feedbackService';

export default function CategoryFilters({ selectedCategory, onSelectCategory }) {
  const { colors: tColors, isDark } = useTheme();
  const styles = useMemo(() => createCategoryFilterStyles(tColors, isDark), [tColors, isDark]);

  const handleSelect = (id) => {
    if (selectedCategory !== id) {
      feedback.pop();
    }
    onSelectCategory(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <TouchableOpacity
        style={[styles.chip, selectedCategory === 'ALL' && styles.chipActive]}
        onPress={() => handleSelect('ALL')}
        activeOpacity={0.8}
      >

        <Text style={[styles.chipText, selectedCategory === 'ALL' && styles.chipTextActive]}>
          All
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const active = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => handleSelect(cat.id)}
            activeOpacity={0.8}
          >

            <Ionicons
              name={cat.icon}
              size={13}
              color={active ? (isDark ? '#0C0E14' : '#FFFFFF') : tColors.textMuted}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
