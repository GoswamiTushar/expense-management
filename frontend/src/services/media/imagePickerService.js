import * as ImagePicker from 'expo-image-picker';

/** Capture a single photo from camera. Returns one URI string or null. */
export const pickReceiptFromCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Camera permission is required to capture receipt images.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.75,
  });

  if (!result.canceled && result.assets?.length > 0) {
    return result.assets[0].uri;   // single URI
  }
  return null;
};

/** Pick one or more photos from gallery. Returns array of URI strings (empty on cancel). */
export const pickReceiptsFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Media gallery permission is required to upload receipt images.');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,   // ← multi-select
    quality: 0.75,
    orderedSelection: true,
  });

  if (!result.canceled && result.assets?.length > 0) {
    return result.assets.map((a) => a.uri);
  }
  return [];
};
