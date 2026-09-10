const DEVICE_ID_KEY = 'socialblitz_device_id';

/**
 * Returns a persistent unique device ID for this browser profile.
 * Stored in localStorage — incognito windows get their own fresh ID
 * (intentional: this is how the backend detects a "new device").
 */
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      // Fallback for older browsers
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
