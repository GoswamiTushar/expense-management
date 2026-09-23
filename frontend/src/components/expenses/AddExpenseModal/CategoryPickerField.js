import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CategoryPickerField.styles';
import { categories, getCategoryById } from '../../../theme/categories';
import { colors } from '../../../theme/colors';

export default function CategoryPickerField({
  selectedCategory,
  onSelectCategory,
  label = 'CATEGORY',
  required = true,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const currentCat = selectedCategory ? getCategoryById(selectedCategory) : null;

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return cat.label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q);
  });

  const handleSelect = (catId) => {
    onSelectCategory(catId);
    setModalVisible(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      {/* Dropdown trigger button */}
      <TouchableOpacity
        style={[styles.triggerBtn, !selectedCategory && styles.triggerBtnEmpty]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          {currentCat ? (
            <>
              <View style={[styles.selectedBadge, { backgroundColor: currentCat.color + '25' }]}>
                <Ionicons name={currentCat.icon} size={15} color={currentCat.color} />
              </View>
              <Text style={styles.selectedText}>{currentCat.label}</Text>
            </>
          ) : (
            <>
              <Ionicons name="pricetag-outline" size={16} color={colors.textDim} />
              <Text style={styles.placeholderText}>Select a Category (Mandatory)...</Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Searchable dropdown modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search category (e.g. Rent, Cleaning)..."
                placeholderTextColor={colors.textDim}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category List */}
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
              {filteredCategories.length === 0 ? (
                <Text style={styles.emptyListText}>No matching categories found</Text>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catItem, isSelected && styles.catItemActive]}
                      onPress={() => handleSelect(cat.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.catItemLeft}>
                        <View style={[styles.catIconBox, { backgroundColor: cat.color + '22' }]}>
                          <Ionicons name={cat.icon} size={16} color={cat.color} />
                        </View>
                        <Text
                          style={[
                            styles.catLabel,
                            isSelected && { color: cat.color, fontWeight: '700' },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={cat.color} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
