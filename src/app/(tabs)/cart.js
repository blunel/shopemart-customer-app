import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { useShop, lineKey } from '../../ShopContext';
import { Button, Empty } from '../../ui';
import { colors, spacing, radius, typography, money } from '../../theme';

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotal, setQty, remove } = useShop();

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <View style={{ alignItems: 'center' }}><ShoppingCart size={46} color={colors.blush} /></View>
        <Empty title="Your cart is empty" sub="Find something you like and add it here." />
        <View style={{ paddingHorizontal: spacing.xxl }}><Button label="Start shopping" onPress={() => router.push('/(tabs)/shop')} /></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={lineKey}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: 130 }}
        renderItem={({ item: i }) => {
          const k = lineKey(i);
          return (
            <View style={styles.line}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: i.slug } })}>
                {i.image ? <Image source={{ uri: i.image }} style={styles.img} /> : <View style={[styles.img, { backgroundColor: colors.primaryTint }]} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{i.name}</Text>
                {i.color || i.size ? <Text style={typography.caption}>{[i.color, i.size].filter(Boolean).join(' · ')}</Text> : null}
                <Text style={styles.price}>{money(i.price)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <View style={styles.qty}>
                    <TouchableOpacity onPress={() => setQty(k, i.qty - 1)} style={styles.qtyBtn}><Minus size={15} color={colors.deep} /></TouchableOpacity>
                    <Text style={styles.qtyNum}>{i.qty}</Text>
                    <TouchableOpacity onPress={() => setQty(k, i.qty + 1)} style={styles.qtyBtn}><Plus size={15} color={colors.deep} /></TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => remove(k)} style={{ marginLeft: 'auto', padding: 6 }} hitSlop={8}><Trash2 size={19} color={colors.error} /></TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.bar}>
        <View>
          <Text style={typography.caption}>Subtotal</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.deep }}>{money(subtotal)}</Text>
        </View>
        <Button label="Checkout" onPress={() => router.push('/checkout')} style={{ flex: 1, marginLeft: spacing.lg }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  line: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  img: { width: 78, height: 78, borderRadius: radius.md, backgroundColor: colors.border },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  price: { fontSize: 15.5, fontWeight: '800', color: colors.deep, marginTop: 2 },
  qty: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { minWidth: 28, textAlign: 'center', fontWeight: '700', color: colors.textPrimary },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
});
