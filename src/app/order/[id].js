import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { getOrder, cancelOrder, picture } from '../../api';
import { Card, Button, Pill, Section, Loading, ErrorText } from '../../ui';
import { confirmAction } from '../../dialog';
import { CUSTOMER_LABEL, STATUS_TONE, STEPS, stepIndex, PAY_LABEL, optionsText } from '../../orderStatus';
import { colors, spacing, radius, typography, money, when } from '../../theme';

export default function OrderScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setData(await getOrder(id)); setError(''); } catch (err) { setError(err.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (data?.order) navigation.setOptions({ title: data.order.orderNo }); }, [data, navigation]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const cancel = () => confirmAction('Cancel this order?', 'It will not be sent to you.', 'Cancel order', async () => {
    setBusy(true); setError('');
    try { await cancelOrder(id); } catch (err) { setError(err.message); } finally { setBusy(false); await load(); }
  }, true);

  if (!data) return <View style={styles.screen}>{error ? <ErrorText>{error}</ErrorText> : <Loading />}</View>;
  const { order, address } = data;
  const step = stepIndex(order.status);
  const gone = order.status === 'CANCELLED' || order.status === 'RETURNED';
  const pointsValue = Number(order.pointsValue || 0);
  const pointsUsed = Number(order.pointsUsed || 0);
  const pointsEarned = Number(order.pointsEarned || 0);
  const couponPart = Math.max(0, Number(order.discount || 0) - pointsValue); // `discount` holds the coupon and the value of any points spent

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={typography.h1}>{order.orderNo}</Text>
          <Text style={typography.caption}>Placed {when(order.createdAt)}</Text>
        </View>
        <Pill label={CUSTOMER_LABEL[order.status] || order.status} tone={STATUS_TONE[order.status] || 'muted'} />
      </View>
      <ErrorText>{error}</ErrorText>

      <Card style={{ marginTop: spacing.md }}>
        {gone ? (
          <Text style={{ color: colors.error, fontWeight: '700' }}>This order was {order.status === 'RETURNED' ? 'returned' : 'cancelled'}.</Text>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            {STEPS.map((label, i) => (
              <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <View style={{ flex: 1, height: 3, backgroundColor: i === 0 ? 'transparent' : (i <= step ? colors.primary : colors.border) }} />
                  <View style={[styles.dot, i <= step && { backgroundColor: colors.primary }]}>{i < step || order.status === 'DELIVERED' ? <Check size={14} color={colors.white} /> : <Text style={{ color: i <= step ? colors.white : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>}</View>
                  <View style={{ flex: 1, height: 3, backgroundColor: i === STEPS.length - 1 ? 'transparent' : (i < step ? colors.primary : colors.border) }} />
                </View>
                <Text style={[styles.stepText, i <= step && { color: colors.textPrimary, fontWeight: '700' }]}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {order.vendorProgress && order.vendorProgress.total > 1 ? (
        <Text style={[typography.caption, { marginTop: spacing.sm }]}>Your order comes from {order.vendorProgress.total} sellers; {order.vendorProgress.ready} of them have it ready.</Text>
      ) : null}

      <Section title="Items">
        <Card style={{ padding: 0 }}>
          {order.items.map((i, idx) => (
            <TouchableOpacity key={i.id} activeOpacity={0.8} onPress={() => i.product?.slug && router.push({ pathname: '/product/[slug]', params: { slug: i.product.slug } })} style={[styles.item, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              {picture(i.product?.images?.[0]) ? <Image source={{ uri: picture(i.product.images[0]) }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: colors.primaryTint }]} />}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{i.product?.name}</Text>
                {optionsText(i) ? <Text style={typography.caption}>{optionsText(i)}</Text> : null}
                <Text style={typography.caption}>{i.qty} × {money(i.sellingPrice)}</Text>
              </View>
              <Text style={{ fontWeight: '800', color: colors.deep }}>{money(Number(i.sellingPrice) * i.qty)}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </Section>

      <Section title="Payment">
        <Card>
          <Row label="Subtotal" value={money(order.subtotal)} />
          {couponPart > 0 ? <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`−${money(couponPart)}`} good /> : null}
          {pointsUsed > 0 ? <Row label={`Points used (${pointsUsed.toLocaleString('en-IN')})`} value={`−${money(pointsValue)}`} good /> : null}
          {Number(order.deliveryFee) > 0 || order.deliveryZone ? <Row label={`Delivery${order.deliveryZone ? ` (${order.deliveryZone})` : ''}`} value={Number(order.deliveryFee) > 0 ? money(order.deliveryFee) : 'Free'} /> : null}
          <Row label="Total" value={money(order.totalAmount)} strong />
          {pointsEarned > 0 ? <Text style={{ color: colors.success, fontSize: 13, marginTop: 6 }}>Points earned: {pointsEarned.toLocaleString('en-IN')}{order.status === 'DELIVERED' ? '' : ' (after delivery)'}</Text> : null}
          <Text style={[typography.caption, { marginTop: 6 }]}>{PAY_LABEL[order.paymentMethod] || 'Cash on delivery'}{order.paymentStatus === 'PAID' ? ' · Paid' : order.paymentMethod && order.paymentMethod !== 'COD' ? ' · Checking your payment' : ' · Pay when it arrives'}</Text>
        </Card>
      </Section>

      {address ? (
        <Section title="Delivery address">
          <Card>
            {address.label ? <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{address.label}</Text> : null}
            <Text style={typography.body}>{address.line1}{address.city ? `, ${address.city}` : ''}</Text>
            {address.phone ? <Text style={typography.caption}>{address.phone}</Text> : null}
          </Card>
        </Section>
      ) : null}

      {order.status === 'PLACED' ? <Button label="Cancel order" variant="danger" onPress={cancel} busy={busy} style={{ marginTop: spacing.xl }} /> : null}
    </ScrollView>
  );
}

const Row = ({ label, value, strong, good }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
    <Text style={[typography.body, strong && { fontWeight: '800', color: colors.deep }, good && { color: colors.success }]}>{label}</Text>
    <Text style={[typography.body, strong && { fontWeight: '800', color: colors.deep, fontSize: 17 }, good && { color: colors.success }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 11, textAlign: 'center', color: colors.textSecondary, marginTop: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  thumb: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.border },
});
