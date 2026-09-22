import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './MemberChecklist.styles';
import { colors } from '../../../theme/colors';
import { formatCurrency } from '../../../utils/currency';

export default function MemberChecklist({ managers = [], managerDetails = [], selectedMembers = [], sharePerPerson, onToggle, currentUser }) {
  const map = {};
  if (currentUser) map[currentUser._id || currentUser.id] = `${currentUser.name} (You)`;
  managerDetails.forEach((m) => {
    const isMe = (currentUser?._id === m.id || currentUser?.id === m.id);
    map[m.id] = isMe ? `${m.name} (You)` : m.name;
  });

  return (
    <View style={styles.container}>
      {managers.map((id) => {
        const isChecked = selectedMembers.includes(id);
        const name = map[id] || (currentUser?._id === id || currentUser?.id === id ? `${currentUser.name} (You)` : 'Co-Manager');
        return (
          <TouchableOpacity key={id} style={styles.row} onPress={() => onToggle(id)} activeOpacity={0.7}>
            <View style={styles.left}>
              <Ionicons name={isChecked ? 'checkbox' : 'square-outline'} size={18} color={isChecked ? colors.primary : colors.textDim} />
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
