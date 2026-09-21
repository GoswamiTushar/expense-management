import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './Avatar.styles';
import { colors } from '../../../theme/colors';

export default function Avatar({ name = 'U', initials = 'U', color = colors.primary, size = 36 }) {
  const display = initials || (name ? name.charAt(0).toUpperCase() : 'U');
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{display}</Text>
    </View>
  );
}
