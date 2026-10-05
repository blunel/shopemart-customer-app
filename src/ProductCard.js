import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import { picture } from './api';
import { useShop } from './ShopContext';
import { colors, spacing, radius, money } from './theme';

/** One product in a two-column grid: picture, name, price (with the old price crossed out), rating, and a heart for the wishlist. */
export default function ProductCard({ item }) {
  const router = useRouter();
  const { isWished, toggleWish } = useShop();
  const img = picture(item.images?.[0]);
  const price = Number(item.price ?? item.retailPrice);
  const off = item.regularPrice && Number(item.regularPrice) > price ? Math.round((1 - price / Number(item.regularPrice)) * 100) : 0;
  const wished = isWished(item.id);
  const soldOut = item.inStock === false && !item.orderableOutOfStock && !item.preorderAllowed;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: item.slug } })}>
      <View>
        {img ? <Image source={{ uri: img }} style={styles.img} resizeMode="cover" /> : <View style={[styles.img, { backgroundColor: colors.primaryTint }]} />}
        {off > 0 ? <Text style={styles.off}>{off}% OFF</Text> : null}
        {soldOut ? <Text style={styles.sold}>Sold out</Text> : null}
        <TouchableOpacity style={styles.heart} onPress={() => toggleWish(item.id)} hitSlop={8} activeOpacity={0.8}>
          <Heart size={17} color={wished ? colors.primary : colors.textMuted} fill={wished ? colors.primary : 'transparent'} />
        </TouchableOpacity>
      </View>
      <View style={{ padding: spacing.sm }}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
          <Text style={styles.price}>{money(price)}</Text>
          {off > 0 ? <Text style={styles.was}>{money(item.regularPrice)}</Text> : null}
        </View>
        {item.rating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
            <Star size={12} color="#F5A524" fill="#F5A524" />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>{Number(item.rating).toFixed(1)} ({item.reviews})</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  img: { width: '100%', aspectRatio: 1, backgroundColor: colors.border },
  name: { fontSize: 13.5, color: colors.textPrimary, fontWeight: '600', minHeight: 36 },
  price: { fontSize: 15.5, fontWeight: '800', color: colors.deep },
  was: { fontSize: 12, color: colors.textMuted, textDecorationLine: 'line-through' },
  off: { position: 'absolute', left: 0, top: 8, backgroundColor: colors.primary, color: colors.white, fontSize: 11, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 3, borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  sold: { position: 'absolute', left: 0, bottom: 0, right: 0, textAlign: 'center', backgroundColor: 'rgba(42,31,35,0.65)', color: colors.white, fontSize: 12, fontWeight: '700', paddingVertical: 3 },
  heart: { position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
});
