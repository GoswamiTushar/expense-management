import { Linking, Platform } from 'react-native';

/**
 * Generates an unambiguous, easy-to-read secret settlement code (e.g., "SPLIT-4F2A").
 * Excludes easily confusable characters (0, O, 1, I).
 */
export const generateSettlementCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SPLIT-${randomPart}`;
};

/**
 * Builds universal NPCI UPI deep link URI with secret code in note & reference.
 */
export const buildUpiUri = ({
  upiId,
  payeeName = 'Partner',
  amount = 0,
  note = '',
  verificationCode = '',
}) => {
  const cleanUpi = (upiId || '').trim();
  const encodedName = encodeURIComponent(payeeName);
  const formattedAmount = Number(amount).toFixed(2);

  // Keep note short and clear with secret code upfront so bank SMS doesn't truncate it
  const fullNote = verificationCode
    ? `${verificationCode}${note ? ' - ' + note : ''}`
    : note || 'Ledger Settlement';
  const encodedNote = encodeURIComponent(fullNote);

  // tr (transaction ref) and tn (transaction note)
  const refParam = verificationCode ? `&tr=${encodeURIComponent(verificationCode)}` : '';

  return `upi://pay?pa=${cleanUpi}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}${refParam}`;
};

/**
 * Launches native UPI intent chooser (GPay, PhonePe, Paytm, etc.).
 */
export const openUpiApp = async ({
  upiId,
  payeeName,
  amount,
  note,
  verificationCode,
}) => {
  if (!upiId) {
    alert('Recipient does not have a UPI ID configured yet.');
    return false;
  }

  const url = buildUpiUri({ upiId, payeeName, amount, note, verificationCode });

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

