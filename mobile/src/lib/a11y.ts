import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Speaks a short message to screen-reader users (e.g. "12 places found"). */
export function announce(message: string) {
  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') return;
    let region = document.getElementById('hf-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'hf-live-region';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('role', 'status');
      region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
      document.body.appendChild(region);
    }
    const target = region;
    target.textContent = '';
    setTimeout(() => {
      target.textContent = message;
    }, 50);
    return;
  }
  AccessibilityInfo.announceForAccessibility(message);
}

/** True when the user has asked the OS to reduce motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/** True while VoiceOver or TalkBack is running, so the UI can avoid gesture-only interactions. */
export function useScreenReader() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => sub.remove();
  }, []);
  return enabled;
}
