import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, FlatList, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Heart, Minus, Plus, Share2, Star, Truck, RotateCcw } from 'lucide-react-native';
import { Share } from 'react-native';
import { product as fetchProduct, related as fetchRelated, feedback as fetchFeedback, picture } from '../../api';
import { useShop } from '../../ShopContext';
import ProductCard from '../../ProductCard';
import { Button, Card, Loading, ErrorText, Section } from '../../ui';
import { notify } from '../../dialog';
import { SITE_URL } from '../../config';
import { colors, spacing, radius, typography, money } from '../../theme';

const list = (v) => (Array.isArray(v) ? v : []);
const key = (c, z) => `${(c || '').toLowerCase()}|${(z || '').toLowerCase()}`;

export default function ProductScreen() {
  const { slug } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { add, isWished, toggleWish } = useShop();
  const { width } = useWindowDimensions();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [rel, setRel] = useState([]);
  const [fb, setFb] = useState(null);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [pickError, setPickError] = useState('');
  const [at, setAt] = useState(0);
  const gallery = useRef(null);

  useEffect(() => {
    setP(null); setError(''); setColor(''); setSize(''); setQty(1); setAt(0);
    fetchProduct(slug).then((d) => {
      if (d.redirectSlug) { router.replace({ pathname: '/product/[slug]', params: { slug: d.redirectSlug } }); return; }
      setP({ ...d.product, variants: list(d.product.variants), colors: list(d.product.colors), specifications: list(d.product.specifications), colorGroup: list(d.product.colorGroup) });
    }).catch((e) => setError(e.message));
    fetchRelated(slug).then((d) => setRel(list(d.items))).catch(() => setRel([]));
    fetchFeedback(slug).then(setFb).catch(() => setFb(null));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!p) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: spacing.lg, marginRight: spacing.sm }}>
          <TouchableOpacity onPress={() => Share.share({ message: `${p.name} — ${SITE_URL}/product/${p.slug}` })} hitSlop={8}><Share2 size={21} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => toggleWish(p.id)} hitSlop={8}><Heart size={21} color={colors.primary} fill={isWished(p.id) ? colors.primary : 'transparent'} /></TouchableOpacity>
        </View>
      ),
    });
  }, [p, navigation, isWished, toggleWish]);

  const sizes = useMemo(() => (p?.sizeChart ? list(p.sizeChart.rows).map((r) => r[0]) : []), [p]);
  const images = useMemo(() => {
    if (!p) return [];
    const fromColor = color ? list(p.colors.find((c) => c.name === color)?.images) : [];
    return [...fromColor, ...list(p.images).filter((u) => !fromColor.includes(u))].map(picture).filter(Boolean);
  }, [p, color]);

  if (!p) return <View style={styles.screen}>{error ? <ErrorText>{error}</ErrorText> : <Loading />}</View>;

  // the same rules as the website's product page
  const rows = p.variants;
  const hasColors = p.colors.length > 0;
  const hasSizes = sizes.length > 0;
  const rowFor = (c, z) => rows.find((r) => key(r.color, r.size) === key(c, z));
  const stockOf = (c, z) => (rows.length === 0 ? p.stockQty : (rowFor(c, z)?.stockQty ?? 0));
  const availableFor = (c, z) => (rows.length === 0 || !!rowFor(c, z)) && (p.orderableOutOfStock || stockOf(c, z) > 0);
  const colorOk = (c) => (!hasSizes ? availableFor(c, '') : sizes.some((z) => (size ? z.toLowerCase() === size.toLowerCase() : true) && availableFor(c, z)));
  const sizeOk = (z) => (!hasColors ? availableFor('', z) : p.colors.some((c) => (color ? c.name === color : true) && availableFor(c.name, z)));
  const choiceMade = (!hasColors || !!color) && (!hasSizes || !!size);
  const chosenColor = hasColors ? color : '';
  const chosenSize = hasSizes ? size : '';
  const extra = rows.length > 0 && choiceMade ? Number(rowFor(chosenColor, chosenSize)?.priceAdjust || 0) : 0;
  const base = Number(p.price);
  const price = base + extra;
  const regular = p.regularPrice != null && Number(p.regularPrice) > base ? Number(p.regularPrice) + extra : null;
  const off = regular ? Math.round((1 - price / regular) * 100) : 0;
  const isFrom = rows.some((r) => Number(r.priceAdjust) > 0) && !choiceMade;
  const left = choiceMade || rows.length === 0 ? stockOf(chosenColor, chosenSize) : null;
  const canBuy = p.orderableOutOfStock || p.preorderAllowed || (rows.length === 0 ? p.stockQty > 0 : rows.some((r) => r.stockQty > 0));

  const problem = () => {
    if (hasColors && !color) return 'Please choose a colour.';
    if (hasSizes && !size) return 'Please choose a size.';
    if (rows.length > 0) {
      if (!rowFor(chosenColor, chosenSize)) return 'That colour and size is not available. Please choose another.';
      if (!p.orderableOutOfStock) {
        const n = stockOf(chosenColor, chosenSize);
        if (n < 1) return 'That colour and size is sold out. Please choose another.';
        if (qty > n) return `Only ${n} left in that colour and size.`;
      }
    } else if (!p.orderableOutOfStock && !p.preorderAllowed && qty > p.stockQty) {
      return p.stockQty < 1 ? 'This product is sold out.' : `Only ${p.stockQty} left.`;
    }
    return '';
  };

  const line = () => ({ productId: p.id, slug: p.slug, name: p.name, image: images[0] || null, price, qty, color: chosenColor || null, size: chosenSize || null });
  const addToCart = (buyNow) => {
    const bad = problem();
    setPickError(bad);
    if (bad) return;
    add(line());
    if (buyNow) router.push('/checkout'); else notify('Added to cart', `${p.name} is in your cart.`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <FlatList
          ref={gallery}
          data={images.length ? images : [null]}
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          keyExtractor={(u, i) => `${u}-${i}`}
          onMomentumScrollEnd={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (item ? <Image source={{ uri: item }} style={{ width, height: width, backgroundColor: colors.border }} resizeMode="cover" /> : <View style={{ width, height: width, backgroundColor: colors.primaryTint }} />)}
        />
        {images.length > 1 ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 }}>
            {images.map((u, i) => <View key={`${u}-${i}`} style={{ width: i === at ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === at ? colors.primary : colors.border }} />)}
          </View>
        ) : null}

        <View style={{ padding: spacing.lg }}>
          <Text style={styles.name}>{p.name}</Text>
          {Number(fb?.reviewCount) > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Star size={14} color="#F5A524" fill="#F5A524" />
              <Text style={typography.caption}>{Number(fb.rating).toFixed(1)} · {fb.reviewCount} review{fb.reviewCount === 1 ? '' : 's'}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' }}>
            <Text style={styles.price}>{isFrom ? 'From ' : ''}{money(price)}</Text>
            {regular ? <Text style={styles.was}>{money(regular)}</Text> : null}
            {off > 0 ? <Text style={styles.off}>{off}% OFF</Text> : null}
          </View>
          {p.flash ? <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 4 }}>Flash sale price</Text> : null}
          {p.sold > 0 ? <Text style={[typography.caption, { marginTop: 2 }]}>{p.sold} sold</Text> : null}

          {hasColors ? (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={typography.label}>Colour{color ? `: ${color}` : ''}</Text>
              <View style={styles.wrap}>
                {p.colors.map((c) => {
                  const ok = colorOk(c.name);
                  return (
                    <TouchableOpacity key={c.name} disabled={!ok} onPress={() => { setColor(c.name); setPickError(''); }} style={[styles.opt, color === c.name && styles.optOn, !ok && styles.optOff]} activeOpacity={0.8}>
                      {c.hex ? <View style={[styles.swatch, { backgroundColor: c.hex }]} /> : null}
                      <Text style={[styles.optText, color === c.name && { color: colors.primary }, !ok && { textDecorationLine: 'line-through' }]}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
          {hasSizes ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={typography.label}>Size{size ? `: ${size}` : ''}</Text>
              <View style={styles.wrap}>
                {sizes.map((z) => {
                  const ok = sizeOk(z);
                  return (
                    <TouchableOpacity key={z} disabled={!ok} onPress={() => { setSize(z); setPickError(''); }} style={[styles.opt, size === z && styles.optOn, !ok && styles.optOff]} activeOpacity={0.8}>
                      <Text style={[styles.optText, size === z && { color: colors.primary }, !ok && { textDecorationLine: 'line-through' }]}>{z}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
          {p.colorGroup.length > 0 ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={typography.label}>Also available in</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginTop: 6 }}>
                {p.colorGroup.map((g) => (
                  <TouchableOpacity key={g.slug} onPress={() => router.replace({ pathname: '/product/[slug]', params: { slug: g.slug } })} style={styles.group} activeOpacity={0.8}>
                    {g.images?.[0] ? <Image source={{ uri: picture(g.images[0]) }} style={styles.groupImg} /> : null}
                    <Text style={styles.optText}>{g.variantColor || g.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
            <Text style={typography.label}>Quantity</Text>
            <View style={styles.qty}>
              <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}><Minus size={16} color={colors.deep} /></TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}><Plus size={16} color={colors.deep} /></TouchableOpacity>
            </View>
            {left !== null && !p.orderableOutOfStock ? <Text style={{ color: left < 1 ? colors.error : left <= 5 ? colors.warning : colors.textSecondary, fontSize: 12.5, fontWeight: '600' }}>{left < 1 ? 'Sold out' : left <= 5 ? `Only ${left} left` : 'In stock'}</Text> : null}
          </View>
          {!canBuy ? <Text style={{ color: colors.error, fontWeight: '700', marginTop: spacing.sm }}>Sold out</Text> : null}
          {!p.inStock && p.preorderAllowed ? <Text style={{ color: colors.warning, fontWeight: '600', marginTop: spacing.sm }}>Out of stock now. You can pre-order and we will send it when it arrives.</Text> : null}
          <ErrorText>{pickError}</ErrorText>

          {p.policy ? (
            <Card style={{ marginTop: spacing.lg, gap: 8 }}>
              {p.policy.deliveryPromise ? <Row icon={Truck} text={p.policy.deliveryPromise} /> : null}
              {p.policy.cod ? <Row icon={Truck} text="Cash on delivery available" /> : null}
              {p.policy.returnDays > 0 ? <Row icon={RotateCcw} text={`${p.policy.returnDays}-day return${p.policy.exchangeDays > 0 ? `, ${p.policy.exchangeDays}-day exchange` : ''}`} /> : null}
            </Card>
          ) : null}

          {p.description ? <Section title="About this product"><Text style={styles.body}>{p.description}</Text></Section> : null}
          {p.longDescription ? <Section title="Details"><Text style={styles.body}>{p.longDescription}</Text></Section> : null}
          {p.specifications.length ? (
            <Section title="Specifications">
              <Card style={{ padding: 0 }}>
                {p.specifications.map((s, i) => (
                  <View key={`${s.name}-${i}`} style={[styles.spec, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 13.5 }}>{s.name}</Text>
                    <Text style={{ flex: 1.3, color: colors.textPrimary, fontSize: 13.5, fontWeight: '600' }}>{s.value}</Text>
                  </View>
                ))}
              </Card>
            </Section>
          ) : null}
          {list(fb?.reviews).length ? (
            <Section title="Reviews">
              {list(fb.reviews).slice(0, 5).map((r) => (
                <Card key={r.id} style={{ marginBottom: spacing.sm, padding: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{r.name || 'Customer'}</Text>
                    <Text style={{ color: '#F5A524', fontSize: 13 }}>{'★'.repeat(Math.max(0, Math.min(5, r.rating || 0)))}</Text>
                  </View>
                  {r.body ? <Text style={[styles.body, { marginTop: 4 }]}>{r.body}</Text> : null}
                </Card>
              ))}
            </Section>
          ) : null}
        </View>

        {rel.length ? (
          <View>
            <Text style={[typography.h2, { marginHorizontal: spacing.lg, marginBottom: spacing.sm }]}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
              {rel.map((x) => <View key={x.id} style={{ width: 150 }}><ProductCard item={x} /></View>)}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bar}>
        <Button label="Add to cart" variant="outline" onPress={() => addToCart(false)} disabled={!canBuy} style={{ flex: 1 }} />
        <Button label={!p.inStock && p.preorderAllowed ? 'Pre-order' : 'Buy now'} onPress={() => addToCart(true)} disabled={!canBuy} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const Row = ({ icon: Icon, text }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Icon size={17} color={colors.primary} />
    <Text style={{ flex: 1, fontSize: 13.5, color: colors.textPrimary }}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  name: { fontSize: 20, fontWeight: '800', color: colors.deep },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary },
  was: { fontSize: 15, color: colors.textMuted, textDecorationLine: 'line-through' },
  off: { backgroundColor: colors.primary, color: colors.white, fontSize: 12, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 6 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optOff: { opacity: 0.4 },
  optText: { fontSize: 13.5, fontWeight: '600', color: colors.textPrimary },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.border },
  group: { alignItems: 'center', gap: 4, padding: 6, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  groupImg: { width: 56, height: 56, borderRadius: radius.sm },
  qty: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card },
  qtyBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { minWidth: 30, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14.5, lineHeight: 21, color: colors.textPrimary },
  spec: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
});
