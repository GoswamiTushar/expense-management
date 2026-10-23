import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Robust file downloader that guarantees proper file names (never UUIDs) across
 * Microsoft Edge, Chrome, Safari, Firefox, and mobile platforms.
 */
export const downloadFile = async (content, fileName, mimeType = 'application/octet-stream') => {
  if (Platform.OS === 'web') {
    const blob = content instanceof Blob
      ? content
      : new Blob([content], { type: mimeType });

    // Using File object passes filename metadata to Chromium / Edge download manager
    const file = new File([blob], fileName, { type: mimeType });
    const url = URL.createObjectURL(file);

    const a = document.createElement('a');
    a.style.position = 'fixed';
    a.style.top = '-9999px';
    a.style.left = '-9999px';
    a.style.opacity = '0';
    a.href = url;
    a.download = fileName;
    a.setAttribute('download', fileName);

    document.body.appendChild(a);

    // Native mouse click event
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);

    // Keep the blob URL mapped for 60 seconds so Windows Defender / Edge SmartScreen
    // finishes inspection without falling back to a raw UUID
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 60000);

    return url;
  }

  // Native mobile fallback
  try {
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    if (typeof content === 'string') {
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // Convert ArrayBuffer or Blob to base64 if needed
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(content);
      });
      const base64Data = await base64Promise;
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, { mimeType, dialogTitle: `Save ${fileName}` });
    }
    return filePath;
  } catch (err) {
    console.warn('Native download failed:', err);
    throw err;
  }
};
