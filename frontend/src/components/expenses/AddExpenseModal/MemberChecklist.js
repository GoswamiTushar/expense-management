import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './MemberChecklist.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';

export default function MemberChecklist({ managers = [], selectedMembers = [], sharePerPerson, onToggle, userMap = {} }) {
  return (
    <View style={styles.container}>
      {managers.map((id) => {
        const isChecked = selectedMembers.includes(id);
        const name = userMap[id]?.name || id;

        return (
          <TouchableOpacity key={id} style={styles.row} onPress={() => onToggle(id)} activeOpacity={0.7}>
            <View style={styles.left}>
              <Ionicons
                name={isChecked ? 'checkbox' : 'square-outline'}
                size={18}
                color={isChecked ? colors.primary : colors.textDim}
              />
              <Text style={styles.name}>{name}</Text>
            </View>
            <Text style={isChecked ? styles.share : styles.excluded}>
              {isChecked ? formatCurrency(sharePerPerson) : 'Excluded'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
