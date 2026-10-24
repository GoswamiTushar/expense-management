import { playSound } from './soundService';
import { triggerHaptic } from './hapticService';
import { getFeedbackSettings } from './feedbackSettings';

/**
 * Unified Feedback Engine for Ledger.
 * Dispatches tactile haptics and synthetic micro-sounds based on user settings.
 */
export const feedback = {
  tap: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('light', hapticsEnabled);
    playSound('tap', soundsEnabled);
  },

  pop: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('selection', hapticsEnabled);
    playSound('pop', soundsEnabled);
  },

  toggle: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('selection', hapticsEnabled);
    playSound('toggle', soundsEnabled);
  },

  tabSwitch: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('selection', hapticsEnabled);
    playSound('pop', soundsEnabled);
  },

  drawer: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('light', hapticsEnabled);
    playSound('drawer', soundsEnabled);
  },

  success: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('success', hapticsEnabled);
    playSound('success', soundsEnabled);
  },

  confirm: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('medium', hapticsEnabled);
    playSound('confirm', soundsEnabled);
  },

  delete: () => {
    const { hapticsEnabled, soundsEnabled } = getFeedbackSettings();
    triggerHaptic('warning', hapticsEnabled);
    playSound('delete', soundsEnabled);
  },
};
