/**
 * Lightweight haptic feedback using the Vibration API.
 * Falls back silently on unsupported devices.
 */

function vibrate(pattern: number | number[]) {
  try {
    navigator?.vibrate?.(pattern);
  } catch {
    // Silently ignore on unsupported devices
  }
}

/** Light tap — button press, minor action */
export function hapticLight() {
  vibrate(10);
}

/** Medium tap — swipe snap, toggle */
export function hapticMedium() {
  vibrate(20);
}

/** Heavy tap — delete, destructive action */
export function hapticHeavy() {
  vibrate([30, 50, 30]);
}

/** Success — pull-to-refresh complete, save success */
export function hapticSuccess() {
  vibrate([15, 40, 15]);
}
