import { Tabs, router } from 'expo-router';
import { Home, Search, ShoppingCart, ShoppingBag, User } from 'lucide-react-native';
import { useAuth } from '../../AuthContext';
import { useShop } from '../../ShopContext';
import { usePushNotifications } from '../../push';
import { colors, headerOptions } from '../../theme';

/** The five tabs of the shop. The cart tab shows how many things are in it. */
export default function TabsLayout() {
  const { user } = useAuth();
  const { count } = useShop();
  usePushNotifications(user, (orderId) => router.push({ pathname: '/order/[id]', params: { id: orderId } }));
  const icon = (Icon) => ({ color, size }) => <Icon color={color} size={size - 2} />;
  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.white, fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false, tabBarIcon: icon(Home) }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', headerShown: false, tabBarIcon: icon(Search) }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: icon(ShoppingCart), tabBarBadge: count > 0 ? count : undefined }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: icon(ShoppingBag) }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon(User) }} />
    </Tabs>
  );
}
