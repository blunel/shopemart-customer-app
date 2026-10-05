import * as Device from 'expo-device';
import { getItem, setItem } from './storage';

/** A random id for this phone, sent with the login as `deviceId`, so the owner's Device Approvals can tell this phone from another. Made once, here. */
const KEY = 'shopemart_device_id';
const randomId = () => `app-${Date.now().toString(36)}-${Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 8)).join('')}`;

export async function getDeviceId() {
  try {
    let id = await getItem(KEY);
    if (!id) { id = randomId(); await setItem(KEY, id); }
    return id;
  } catch (err) {
    return randomId();
  }
}

export function getDeviceLabel() {
  const name = [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') || 'ShopeMart app phone';
  return `${name}${Device.osName ? ` (${Device.osName}${Device.osVersion ? ` ${Device.osVersion}` : ''})` : ''}`.slice(0, 120);
}
