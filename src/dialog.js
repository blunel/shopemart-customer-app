import { Alert, Platform } from 'react-native';

/*
 * Alert.alert does nothing in the browser version of the app (used for quick testing on a computer), so on the web fall back to the
 * browser's own boxes. On a phone this is just Alert.alert.
 *   notify('Saved')                       one OK button
 *   confirmAction(title, message, 'Yes', fn)   Cancel + a confirm button that runs fn
 */
export function notify(title, message, onOk) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    if (onOk) onOk();
    return;
  }
  Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
}

export function confirmAction(title, message, confirmLabel, onConfirm, destructive = false) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
