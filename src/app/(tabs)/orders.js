import { useCallback, useState } from 'react';
import { View, Text, FlatList, ScrollView, Image, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { myOrders, picture } from '../../api';
import { useAuth } from '../../AuthContext';
import { Card, Chip, Pill, Empty, ErrorText, Button, Loading } from '../../ui';
import { CUSTOMER_LABEL, STATUS_TONE, ORDER_TABS, PAY_LABEL } from '../../orderStatus';
import { colors, spacing, typography, money, when } from '../../theme';

export default function OrdersScreen() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try { const d = await myOrders(); setRows(d.orders); setError(''); } catch (err) { setError(err.message); }
  }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!ready) return <View style={styles.screen}><Loading /></View>;
  if (!user) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', padding: spacing.xl }]}>
        <Empty title="Sign in to see your orders" sub="Your orders, their progress and your points live in your account." />
        <Button label="Sign in" onPress={() => router.push('/login')} />
        <Button label="Create an account" variant="outline" onPress={() => router.push('/register')} style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  const active = ORDER_TABS.find((t) => t.key === tab);
  const shown = (rows || []).filter(active.match);

  return (
    <View style={styles.screen}>
      <View style={{ height: 52, paddingTop: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: 'center' }}>
          {ORDER_TABS.map((t) => <Chip key={t.key} label={t.label} count={rows ? rows.filter(t.match).length : undefined} on={tab === t.key} onPress={() => setTab(t.key)} />)}
        </ScrollView>
      </View>
      <ErrorText>{error}</ErrorText>
      {!rows && !error ? <Loading /> : (
        <FlatList
          data={shown}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item: o }) => (
            <Card style={{ padding: spacing.md }} onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '800', color: colors.deep }}>{o.orderNo}</Text>
                <Pill label={CUSTOMER_LABEL[o.status] || o.status} tone={STATUS_TONE[o.status] || 'muted'} />
              </View>
              <Text style={[typography.caption, { marginVertical: 4 }]}>{when(o.createdAt)}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                {o.items.slice(0, 4).map((i) => (picture(i.product?.images?.[0]) ? <Image key={i.id} source={{ uri: picture(i.product.images[0]) }} style={styles.thumb} /> : <View key={i.id} style={[styles.thumb, { backgroundColor: colors.primaryTint }]} />))}
                {o.items.length > 4 ? <Text style={[typography.caption, { alignSelf: 'center' }]}>+{o.items.length - 4}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={typography.caption}>{PAY_LABEL[o.paymentMethod] || 'Cash on delivery'}</Text>
                <Text style={{ fontWeight: '800', color: colors.deep, fontSize: 16 }}>{money(o.totalAmount)}</Text>
              </View>
            </Card>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListEmptyComponent={<Empty title={rows && rows.length === 0 ? "You haven't ordered yet" : 'No orders here'} sub={rows && rows.length === 0 ? 'Your orders show up here.' : ''} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.border },
});
