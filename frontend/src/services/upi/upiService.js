import { Linking, Platform } from 'react-native';

/**
 * Builds universal NPCI UPI deep link URI.
 */
export const buildUpiUri = ({ upiId, payeeName = 'Manager', amount = 0, note = 'Expense Settlement' }) => {
  const cleanUpi = (upiId || '').trim();
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(note);
  const formattedAmount = Number(amount).toFixed(2);

  return `upi://pay?pa=${cleanUpi}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}`;
};

/**
 * Launches native UPI intent chooser (GPay, PhonePe, Paytm, etc.).
 */
export const openUpiApp = async ({ upiId, payeeName, amount, note }) => {
  if (!upiId) {
    alert('Recipient does not have a UPI ID configured yet.');
    return false;
  }

  const url = buildUpiUri({ upiId, payeeName, amount, note });

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
    return true;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      await Linking.openURL(url); // Try direct invoke anyway on Android
      return true;
    }
  } catch (err) {
    alert(`Could not launch UPI app directly: ${err.message}. You can copy the UPI ID manually.`);
    return false;
  }
};
