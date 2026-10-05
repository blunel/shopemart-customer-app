import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Heart, ShoppingBag, Globe, Headphones, ChevronRight, Gift } from 'lucide-react-native';
import { myPoints } from '../../api';
import { useAuth } from '../../AuthContext';
import { useShop } from '../../ShopContext';
import { Card, Button, Section } from '../../ui';
import { confirmAction } from '../../dialog';
import { SITE_URL } from '../../config';
import { colors, spacing, typography, when } from '../../theme';

const KIND = { EARN: 'Earned', REDEEM: 'Used on an order', REVERSE: 'Taken back', RESTORE: 'Given back', ADJUST: 'Added by the shop', EXPIRE: 'Expired' };

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { wish } = useShop();
  const router = useRouter();
  const [points, setPoints] = useState(null);

  useFocusEffect(useCallback(() => {
    if (user) myPoints().then((d) => setPoints(d.points)).catch(() => {}); else setPoints(null);
  }, [user]));

  const confirmLogout = () => confirmAction('Sign out', 'Sign out of ShopeMart on this phone?', 'Sign out', logout, true);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      {user ? (
        <Card>
          <Text style={typography.h2}>My account</Text>
          <Text style={typography.caption}>{user.phone}</Text>
        </Card>
      ) : (
        <Card>
          <Text style={typography.h2}>Welcome to ShopeMart</Text>
          <Text style={[typography.caption, { marginTop: 4 }]}>Sign in to see your orders and earn points on every order.</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button label="Sign in" small style={{ flex: 1 }} onPress={() => router.push('/login')} />
            <Button label="Create account" variant="outline" small style={{ flex: 1 }} onPress={() => router.push('/register')} />
          </View>
        </Card>
      )}

      {points && points.enabled ? (
        <Section title="My points">
          <View style={styles.hero}>
            <Gift size={22} color={colors.blush} />
            <Text style={styles.heroValue}>{points.balance.toLocaleString('en-IN')}</Text>
            <Text style={{ color: colors.blush, fontSize: 12.5, textAlign: 'center' }}>
              points · worth ৳{(points.balance * Number(points.rules?.pointValue || 0)).toFixed(0)}
              {points.expiringSoon?.length ? `\n${points.expiringSoon[0].points} expire ${when(points.expiringSoon[0].expiresAt).split(' ').slice(0, 2).join(' ')}` : ''}
            </Text>
          </View>
          {points.history?.slice(0, 6).map((h) => (
            <View key={h.id} style={styles.hist}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{KIND[h.kind] || h.kind}</Text>
                <Text style={typography.caption}>{when(h.at)}{h.note ? ` · ${h.note}` : ''}</Text>
              </View>
              <Text style={{ fontWeight: '800', color: h.points < 0 ? colors.error : colors.success }}>{h.points > 0 ? '+' : ''}{h.points}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      <Section title="Shortcuts">
        <Card style={{ padding: 0 }}>
          <Link icon={ShoppingBag} label="My orders" onPress={() => router.push('/(tabs)/orders')} />
          <Link icon={Heart} label={`Wishlist${wish.length ? ` (${wish.length})` : ''}`} onPress={() => router.push('/wishlist')} />
          <Link icon={Headphones} label="Help and contact" onPress={() => Linking.openURL(`${SITE_URL}/contact`)} />
          <Link icon={Globe} label="Open the website" onPress={() => Linking.openURL(SITE_URL)} last />
        </Card>
      </Section>

      {user ? <Button label="Sign out" variant="danger" onPress={confirmLogout} style={{ marginTop: spacing.xl }} /> : null}
      <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.lg }}>ShopeMart {Constants.expoConfig?.version || ''}</Text>
    </ScrollView>
  );
}

const Link = ({ icon: Icon, label, onPress, last }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.link, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <Icon size={19} color={colors.primary} />
    <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '600' }}>{label}</Text>
    <ChevronRight size={18} color={colors.textMuted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  hero: { backgroundColor: colors.deep, borderRadius: 16, padding: spacing.lg, alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  heroValue: { color: colors.white, fontSize: 34, fontWeight: '800' },
  hist: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
});
