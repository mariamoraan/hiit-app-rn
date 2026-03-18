import * as Haptics from 'expo-haptics';

// Haptic patterns
export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (_) {}
}

export async function hapticMedium() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (_) {}
}

export async function hapticHeavy() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (_) {}
}

export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_) {}
}

export async function hapticWarning() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (_) {}
}

// Countdown last 3 seconds
export async function hapticCountdown() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (_) {}
}

// Phase change (work → rest or rest → work)
export async function hapticPhaseChange(toWork: boolean) {
  if (toWork) {
    await hapticHeavy();
  } else {
    await hapticMedium();
  }
}
