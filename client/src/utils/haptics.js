/**
 * CivicPath Haptic Feedback Utility
 * 
 * Safely triggers vibration on supported touch/mobile devices
 * for explicit user confirmations (e.g. Plot Questionnaire submission).
 * Gracefully no-ops in unsupported environments, desktop, or private browsing.
 */

export function triggerHaptic(type = 'submit') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  // Check Web Vibration API availability
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return;
  }

  try {
    switch (type) {
      case 'submit':
      case 'confirm':
        // Short crisp double pulse for successful explicit submission
        navigator.vibrate([18, 30, 24]);
        break;
      case 'select':
        // Subtle single tick
        navigator.vibrate(8);
        break;
      case 'warning':
        // Distinct alert pulse
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(15);
        break;
    }
  } catch {
    // Fail silently without affecting UI flow
  }
}
