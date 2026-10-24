import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_HAPTICS = '@ledger_haptics_enabled_v1';
const STORAGE_KEY_SOUNDS = '@ledger_sounds_enabled_v1';

let hapticsEnabledState = true;
let soundsEnabledState = true;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn({ hapticsEnabled: hapticsEnabledState, soundsEnabled: soundsEnabledState });
    } catch (_) {}
  });
};

// Initialize settings from AsyncStorage on module load
(async () => {
  try {
    const [savedHaptics, savedSounds] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_HAPTICS),
      AsyncStorage.getItem(STORAGE_KEY_SOUNDS),
    ]);
    if (savedHaptics !== null) {
      hapticsEnabledState = savedHaptics === 'true';
    }
    if (savedSounds !== null) {
      soundsEnabledState = savedSounds === 'true';
    }
    notifyListeners();
  } catch (_) {}
})();

export const getFeedbackSettings = () => ({
  hapticsEnabled: hapticsEnabledState,
  soundsEnabled: soundsEnabledState,
});

export const setHapticsEnabled = async (enabled) => {
  hapticsEnabledState = Boolean(enabled);
  notifyListeners();
  try {
    await AsyncStorage.setItem(STORAGE_KEY_HAPTICS, String(hapticsEnabledState));
  } catch (_) {}
};

export const setSoundsEnabled = async (enabled) => {
  soundsEnabledState = Boolean(enabled);
  notifyListeners();
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SOUNDS, String(soundsEnabledState));
  } catch (_) {}
};

export const subscribeFeedbackSettings = (listener) => {
  listeners.add(listener);
  listener({ hapticsEnabled: hapticsEnabledState, soundsEnabled: soundsEnabledState });
  return () => listeners.delete(listener);
};
