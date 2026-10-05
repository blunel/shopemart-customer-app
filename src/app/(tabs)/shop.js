import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { products, categories } from '../../api';
import ProductGrid from '../../ProductGrid';
import { Chip, Empty, ErrorText, Loading } from '../../ui';
import { colors, spacing, radius, typography } from '../../theme';

const PAGE = 20;
const SORTS = [['newest', 'Newest'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low']];

export default function ShopScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [sort, setSort] = useState('newest');
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const seq = useRef(0);
  const category = typeof params.category === 'string' ? params.category : '';

  useEffect(() => { categories().then((d) => setCats(d.categories)).catch(() => {}); }, []);
  // a search typed on the Home screen's box, or a link to a category
  useEffect(() => { if (typeof params.q === 'string') { setText(params.q); setQ(params.q); } }, [params.q]);
  useEffect(() => { const t = setTimeout(() => setQ(text.trim()), 400); return () => clearTimeout(t); }, [text]);

  const load = useCallback(async (nextPage = 1) => {
    const mine = ++seq.current;
    try {
      const d = await products({ q, category, sort, page: nextPage, pageSize: PAGE });
      if (mine !== seq.current) return;
      setRows((old) => (nextPage === 1 ? d.items : [...(old || []), ...d.items.filter((x) => !(old || []).some((o) => o.id === x.id))]));
      setTotal(d.total); setPage(nextPage); setError('');
    } catch (err) { if (mine === seq.current) setError(err.message); }
  }, [q, category, sort]);
  useEffect(() => { setRows(null); load(1); }, [load]);

  const more = async () => {
    if (loadingMore || !rows || rows.length >= total) return;
    setLoadingMore(true); await load(page + 1); setLoadingMore(false);
  };

  const top = cats.filter((c) => !c.parentId);
  const pick = (slug) => router.setParams({ category: slug || '' });
  const current = cats.find((c) => c.slug === category);

  const header = (
    <View>
      <View style={styles.search}>
        <Search size={17} color={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Search products" placeholderTextColor={colors.textMuted} value={text} onChangeText={setText} returnKeyType="search" autoCapitalize="none" />
        {text ? <TouchableOpacity onPress={() => { setText(''); setQ(''); }} hitSlop={8}><X size={17} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>
      <View style={{ height: 46 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: 'center' }}>
          <Chip label="All" on={!category} onPress={() => pick('')} />
          {top.map((c) => <Chip key={c.id} label={c.name} on={category === c.slug} onPress={() => pick(c.slug)} />)}
          {category && !top.some((c) => c.slug === category) && current ? <Chip label={current.name} on onPress={() => pick('')} /> : null}
        </ScrollView>
      </View>
      <View style={{ height: 40 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: 'center' }}>
          {SORTS.map(([k, l]) => <Chip key={k} label={l} on={sort === k} onPress={() => setSort(k)} />)}
        </ScrollView>
      </View>
      <ErrorText>{error}</ErrorText>
      {rows ? <Text style={[typography.caption, { marginHorizontal: spacing.lg, marginVertical: spacing.sm }]}>{total} product{total === 1 ? '' : 's'}{current ? ` in ${current.name}` : ''}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ProductGrid items={rows || []} onEnd={more} loadingMore={loadingMore} header={header}
        empty={!rows && !error ? <Loading /> : (rows ? <Empty title="Nothing found" sub="Try another word or category." /> : null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, margin: spacing.lg, marginBottom: spacing.sm },
  input: { flex: 1, paddingVertical: 11, fontSize: 14.5, color: colors.textPrimary },
});
