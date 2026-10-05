/*
 * The one thing to change per environment: the live site's API. To try the app against a backend on your own computer, start it with
 * EXPO_PUBLIC_API_URL set to your computer's address (a phone is a different device, so not "localhost"), e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.5:4000 npx expo start
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.shopemart.com.bd';
export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://shopemart.com.bd';
