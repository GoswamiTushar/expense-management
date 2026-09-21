import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from './OtaLinksField.styles';

export default function OtaLinksField({ otaLinks = {}, onChangeLinks }) {
  const [open, setOpen] = useState(false);

  const update = (key, val) => {
    onChangeLinks({ ...otaLinks, [key]: val.trim() });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>POSTED LISTING LINKS (AIRBNB, AGODA, ETC.)</Text>
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <Text style={styles.toggleText}>{open ? 'Hide Links' : '+ Add Links'}</Text>
        </TouchableOpacity>
      </View>

      {open && (
        <View style={styles.box}>
          <View style={styles.fieldRow}>
            <Text style={styles.platformBadge}>Airbnb</Text>
            <TextInput style={styles.input} placeholder="https://airbnb.com/rooms/..." placeholderTextColor="#64748B" value={otaLinks.airbnb} onChangeText={(v) => update('airbnb', v)} autoCapitalize="none" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.platformBadge}>Booking.com</Text>
            <TextInput style={styles.input} placeholder="https://booking.com/hotel/..." placeholderTextColor="#64748B" value={otaLinks.booking} onChangeText={(v) => update('booking', v)} autoCapitalize="none" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.platformBadge}>Goibibo/MMT</Text>
            <TextInput style={styles.input} placeholder="https://goibibo.com/hotels/..." placeholderTextColor="#64748B" value={otaLinks.goibibo} onChangeText={(v) => update('goibibo', v)} autoCapitalize="none" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.platformBadge}>Agoda</Text>
            <TextInput style={styles.input} placeholder="https://agoda.com/..." placeholderTextColor="#64748B" value={otaLinks.agoda} onChangeText={(v) => update('agoda', v)} autoCapitalize="none" />
          </View>
        </View>
      )}
    </View>
  );
}
