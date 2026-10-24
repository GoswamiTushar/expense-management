import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getFeedbackSettings,
  setHapticsEnabled as saveHapticsSetting,
  setSoundsEnabled as saveSoundsSetting,
  subscribeFeedbackSettings,
} from '../services/feedback/feedbackSettings';
import { feedback } from '../services/feedback/feedbackService';

const FeedbackContext = createContext({
  hapticsEnabled: true,
  soundsEnabled: true,
  setHapticsEnabled: () => {},
  setSoundsEnabled: () => {},
  feedback,
});

export const FeedbackProvider = ({ children }) => {
  const [settings, setSettings] = useState(getFeedbackSettings);

  useEffect(() => {
    const unsubscribe = subscribeFeedbackSettings((newSettings) => {
      setSettings({ ...newSettings });
    });
    return unsubscribe;
  }, []);

  const setHapticsEnabled = (val) => {
    saveHapticsSetting(val);
  };

  const setSoundsEnabled = (val) => {
    saveSoundsSetting(val);
  };

  return (
    <FeedbackContext.Provider
      value={{
        hapticsEnabled: settings.hapticsEnabled,
        soundsEnabled: settings.soundsEnabled,
        setHapticsEnabled,
        setSoundsEnabled,
        feedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
