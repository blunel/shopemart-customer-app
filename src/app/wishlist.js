import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { products } from '../api';
import { useShop } from '../ShopContext';
import ProductGrid from '../ProductGrid';
import { Empty, ErrorText, Loading } from '../ui';
import { colors, spacing } from '../theme';

/** The products the shopper has hearted, kept on the phone. Removing a heart takes the card off the list. */
export default function WishlistScreen() {
  const { wish, loaded } = useShop();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loaded) return;
    if (wish.length === 0) { setRows([]); return; }
    products({ ids: wish.slice(0, 60).join(','), pageSize: 60 }).then((d) => { setRows(d.items); setError(''); }).catch((e) => setError(e.message));
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = (rows || []).filter((p) => wish.includes(p.id));
  return (
    <View style={styles.screen}>
      <ErrorText>{error}</ErrorText>
      {!rows && !error ? <Loading /> : <ProductGrid items={shown} header={<View style={{ height: spacing.lg }} />} empty={<Empty title="Nothing saved yet" sub="Tap the heart on a product to keep it here." />} />}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background } });
