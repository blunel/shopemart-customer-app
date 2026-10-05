import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import ProductCard from './ProductCard';
import { colors, spacing } from './theme';

/** A two-column grid of ProductCards that loads the next page when the end is near. `header` sits above the first row. */
export default function ProductGrid({ items, onEnd, loadingMore, header, empty, refreshing, onRefresh }) {
  return (
    <FlatList
      data={items.length % 2 ? [...items, { id: '_pad', pad: true }] : items}
      numColumns={2}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={header}
      columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
      contentContainerStyle={{ gap: spacing.sm, paddingBottom: 30 }}
      renderItem={({ item }) => (item.pad ? <View style={{ flex: 1 }} /> : <ProductCard item={item} />)}
      onEndReached={onEnd}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={empty}
      ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : <View style={{ height: 4 }} />}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
    />
  );
}
