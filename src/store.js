import AsyncStorage from '@react-native-async-storage/async-storage';

/** Larger things the phone keeps for the person (the cart, the wishlist): AsyncStorage, which unlike the secure store has no size limit worth worrying about. */
export async function load(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

export async function save(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* the app works without it, only forgets on restart */ }
}
