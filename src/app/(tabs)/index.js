import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ScrollView, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Zap } from 'lucide-react-native';
import { home, products, picture } from '../../api';
import ProductGrid from '../../ProductGrid';
import ProductCard from '../../ProductCard';
import { openLink } from '../../links';
import { ErrorText } from '../../ui';
import { colors, spacing, radius, typography } from '../../theme';

const PAGE = 20;

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const [h, p] = await Promise.all([home(), products({ pageSize: PAGE, sort: 'newest' })]);
      setData(h); setItems(p.items); setTotal(p.total); setPage(1); setError('');
    } catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const more = async () => {
    if (busy.current || items.length >= total) return;
    busy.current = true; setLoadingMore(true);
    try {
      const p = await products({ pageSize: PAGE, sort: 'newest', page: page + 1 });
      setItems((old) => [...old, ...p.items.filter((x) => !old.some((o) => o.id === x.id))]); setPage(page + 1);
    } catch (err) { /* the next scroll tries again */ } finally { busy.current = false; setLoadingMore(false); }
  };

  const header = (
    <View>
      <TouchableOpacity style={styles.search} activeOpacity={0.85} onPress={() => router.push('/(tabs)/shop')}>
        <Search size={17} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 14.5 }}>Search products</Text>
      </TouchableOpacity>
      <ErrorText>{error}</ErrorText>
      {data ? (
        <>
          <Banners list={data.hero?.length ? data.hero : data.sliders} router={router} />
          {data.homeCategories?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingVertical: spacing.md }}>
              {data.homeCategories.map((c) => (
                <TouchableOpacity key={c.id} style={styles.cat} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(tabs)/shop', params: { category: c.slug } })}>
                  {c.imageUrl ? <Image source={{ uri: picture(c.imageUrl) }} style={styles.catImg} /> : <View style={[styles.catImg, { backgroundColor: colors.primaryTint }]} />}
                  <Text style={styles.catName} numberOfLines={2}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
          {data.flash ? <Strip title={data.flash.title || 'Flash sale'} icon items={data.flash.items} endsAt={data.flash.endsAt} /> : null}
          {data.featured?.length ? <Strip title="Featured" items={data.featured} /> : null}
          <Text style={[typography.h2, { margin: spacing.lg, marginBottom: spacing.sm }]}>For you</Text>
        </>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProductGrid items={items} onEnd={more} loadingMore={loadingMore} header={header} refreshing={refreshing} onRefresh={refresh}
        empty={data ? <Text style={[typography.caption, { textAlign: 'center', margin: spacing.xl }]}>No products yet.</Text> : null} />
    </SafeAreaView>
  );
}

/** The owner's banners, one at a time, swiped sideways. */
function Banners({ list, router }) {
  const { width } = useWindowDimensions();
  const [at, setAt] = useState(0);
  if (!list || list.length === 0) return null;
  const w = width - spacing.lg * 2;
  return (
    <View style={{ marginTop: spacing.sm }}>
      <FlatList
        data={list}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(b) => b.id}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item: b }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openLink(router, b.linkUrl)} style={{ width, paddingHorizontal: spacing.lg }}>
            <Image source={{ uri: picture(b.mobileImageUrl || b.imageUrl) }} style={{ width: w, height: w * 0.5, borderRadius: radius.lg, backgroundColor: colors.border }} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />
      {list.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 }}>
          {list.map((b, i) => <View key={b.id} style={{ width: i === at ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === at ? colors.primary : colors.border }} />)}
        </View>
      ) : null}
    </View>
  );
}

/** A sideways row of product cards under a title (the flash sale, the featured products). */
function Strip({ title, items, icon, endsAt }) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        {icon ? <Zap size={18} color={colors.primary} fill={colors.primary} /> : null}
        <Text style={typography.h2}>{title}</Text>
        {endsAt ? <Countdown to={endsAt} /> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        {items.map((p) => <View key={p.id} style={{ width: 150 }}><ProductCard item={p} /></View>)}
      </ScrollView>
    </View>
  );
}

function Countdown({ to }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(to).getTime() - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(to).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [to]);
  if (left <= 0) return null;
  const s = Math.floor(left / 1000);
  const two = (n) => String(n).padStart(2, '0');
  const d = Math.floor(s / 86400);
  return <Text style={styles.count}>{d > 0 ? `${d}d ` : ''}{two(Math.floor((s % 86400) / 3600))}:{two(Math.floor((s % 3600) / 60))}:{two(s % 60)}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: 12, marginHorizontal: spacing.lg, marginTop: spacing.sm },
  cat: { width: 72, alignItems: 'center' },
  catImg: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.border },
  catName: { fontSize: 11.5, color: colors.textPrimary, textAlign: 'center', marginTop: 5, fontWeight: '600' },
  count: { marginLeft: 'auto', backgroundColor: colors.primary, color: colors.white, fontSize: 12.5, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
});
