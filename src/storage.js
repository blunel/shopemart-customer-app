import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Small secret values (the login token, this phone's id): the phone's secure store; in a browser (only used to try the app on a computer) localStorage. */
export const getItem = (key) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key));
export const setItem = (key, value) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.setItem(key, value)) : SecureStore.setItemAsync(key, value));
export const removeItem = (key) => (Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.removeItem(key)) : SecureStore.deleteItemAsync(key));
