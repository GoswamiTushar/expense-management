import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ImagePickerField.styles';
import { colors } from '../../../theme/colors';
import { pickReceiptFromCamera, pickReceiptFromGallery } from '../../../services/media/imagePickerService';

export default function ImagePickerField({ receiptUrl, onSelectReceipt }) {
  const handleCamera = async () => {
    const uri = await pickReceiptFromCamera();
    if (uri) onSelectReceipt(uri);
  };

  const handleGallery = async () => {
    const uri = await pickReceiptFromGallery();
    if (uri) onSelectReceipt(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ATTACH BILL / RECEIPT PHOTO (OPTIONAL)</Text>
      {receiptUrl ? (
        <View style={styles.previewBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.previewText}>Receipt Attached (Ready for S3)</Text>
          </View>
          <TouchableOpacity onPress={() => onSelectReceipt('')}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCamera}>
            <Ionicons name="camera" size={16} color={colors.primary} />
            <Text style={styles.btnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleGallery}>
            <Ionicons name="images" size={16} color={colors.info} />
            <Text style={styles.btnText}>Photo Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
