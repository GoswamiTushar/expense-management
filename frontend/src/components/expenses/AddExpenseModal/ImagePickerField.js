import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ImagePickerField.styles';
import { colors } from '../../../theme/colors';
import { pickReceiptFromCamera, pickReceiptsFromGallery } from '../../../services/media/imagePickerService';

export default function ImagePickerField({ receiptUrls = [], addReceiptUrls, removeReceiptUrl }) {
  const [lightboxUri, setLightboxUri] = useState(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const handleCamera = async () => {
    setLoadingCamera(true);
    try {
      const uri = await pickReceiptFromCamera();
      if (uri) addReceiptUrls(uri);
    } finally { setLoadingCamera(false); }
  };

  const handleGallery = async () => {
    setLoadingGallery(true);
    try {
      const uris = await pickReceiptsFromGallery();
      if (uris.length) addReceiptUrls(uris);
    } finally { setLoadingGallery(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>ATTACH BILL / RECEIPT PHOTO (OPTIONAL)</Text>
        {receiptUrls.length > 0 && (
          <Text style={styles.countBadge}>{receiptUrls.length} photo{receiptUrls.length > 1 ? 's' : ''}</Text>
        )}
      </View>

      {/* Horizontal scrollable image thumbnail grid */}
      {receiptUrls.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewScroll}
          contentContainerStyle={styles.previewRow}
        >
          {receiptUrls.map((uri, idx) => (
            <View key={uri} style={styles.thumbWrapper}>
              {/* Tap thumbnail to open full-screen lightbox */}
              <TouchableOpacity onPress={() => setLightboxUri(uri)} activeOpacity={0.85}>
                <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.tapHint}>
                  <Ionicons name="expand-outline" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              {/* Number badge */}
              <View style={styles.thumbIndexBadge}>
                <Text style={styles.thumbIndexText}>{idx + 1}</Text>
              </View>
              {/* Remove this image */}
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeReceiptUrl(uri)}>
                <Ionicons name="close-circle" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action buttons — always shown so user can keep adding photos */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCamera} disabled={loadingCamera}>
          {loadingCamera
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Ionicons name="camera" size={16} color={colors.primary} />}
          <Text style={styles.btnText}>{receiptUrls.length > 0 ? 'Add Camera' : 'Take Photo'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleGallery} disabled={loadingGallery}>
          {loadingGallery
            ? <ActivityIndicator size="small" color={colors.info} />
            : <Ionicons name="images" size={16} color={colors.info} />}
          <Text style={styles.btnText}>{receiptUrls.length > 0 ? 'Add More' : 'Photo Library'}</Text>
        </TouchableOpacity>
      </View>

      {/* Full-screen lightbox — tap anywhere to close */}
      <Modal visible={!!lightboxUri} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
        <TouchableOpacity style={styles.lightboxOverlay} activeOpacity={1} onPress={() => setLightboxUri(null)}>
          <Image source={{ uri: lightboxUri }} style={styles.lightboxImage} resizeMode="contain" />
          <View style={styles.lightboxClose}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </View>
          <Text style={styles.lightboxHint}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
