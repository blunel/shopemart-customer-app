import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../AuthContext';
import { ShopProvider } from '../ShopContext';
import OfflineBanner from '../OfflineBanner';
import { headerOptions } from '../theme';

/** The shop opens for everyone: signing in is only needed to keep orders and points under an account. */
export default function RootLayout() {
  return (
    <AuthProvider>
      <ShopProvider>
        <StatusBar style="dark" />
        <OfflineBanner />
        <Stack screenOptions={headerOptions}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Sign in' }} />
          <Stack.Screen name="register" options={{ title: 'Create account' }} />
          <Stack.Screen name="product/[slug]" options={{ title: '' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
          <Stack.Screen name="wishlist" options={{ title: 'Wishlist' }} />
          <Stack.Screen name="delete-account" options={{ title: 'Delete account' }} />
        </Stack>
      </ShopProvider>
    </AuthProvider>
  );
}
