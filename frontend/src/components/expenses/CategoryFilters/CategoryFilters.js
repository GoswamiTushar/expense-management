import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CategoryFilters.styles';
import { categories } from '../../../theme/categories';
import { colors } from '../../../theme/colors';

export default function CategoryFilters({ selectedCategory, onSelectCategory }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <TouchableOpacity
        style={[styles.chip, selectedCategory === 'ALL' && styles.chipActive]}
        onPress={() => onSelectCategory('ALL')}
      >
        <Text style={[styles.chipText, selectedCategory === 'ALL' && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const active = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelectCategory(cat.id)}
          >
            <Ionicons name={cat.icon} size={12} color={active ? colors.white : colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
