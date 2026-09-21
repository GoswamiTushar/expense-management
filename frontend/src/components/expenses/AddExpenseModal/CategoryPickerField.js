import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CategoryPickerField.styles';
import { categories } from '../../../theme/categories';
import { colors } from '../../../theme/colors';

export default function CategoryPickerField({ selectedCategory, onSelectCategory }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>CATEGORY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={13}
                color={isSelected ? colors.white : colors.textMuted}
              />
              <Text style={[styles.text, isSelected && { color: colors.white, fontWeight: '700' }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
