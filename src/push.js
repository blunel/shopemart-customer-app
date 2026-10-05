import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch, getToken } from './api';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
  });
}

/** Asks for permission and hands this phone's push token to the backend, so a new order or a payout can reach it. Only on a real device (an emulator has no push service); a missing push setup is not an error. */
async function registerForPush() {
  try {
    if (!Device.isDevice || Platform.OS === 'web') return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', { name: 'Orders and payouts', importance: Notifications.AndroidImportance.HIGH, sound: 'default' });
    }
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (!(await getToken()) || !token) return;
    await apiFetch('/api/push-tokens', { method: 'POST', body: JSON.stringify({ token, platform: Platform.OS }) }).catch(() => {});
  } catch (err) { /* no push set up yet: the app works without it */ }
}

/** Call once from the signed-in layout: registers the phone and opens an order when its notification is tapped. */
export function usePushNotifications(user, onOpenOrder) {
  useEffect(() => {
    if (!user) return undefined;
    registerForPush();
    if (Platform.OS === 'web') return undefined;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId;
      if (orderId) onOpenOrder(orderId);
    });
    return () => sub.remove();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
}
