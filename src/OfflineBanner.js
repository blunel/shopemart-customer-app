import { Text, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';
import { colors } from './theme';

/**
 * A thin bar pinned under the status bar, on every screen (mounted once in the root layout), whenever
 * the phone genuinely has no working connection. `isInternetReachable` starts `null` while Expo is still
 * finding out - only `false` (a confirmed "no") shows the bar, so there's no false flash on a cold start.
 */
export default function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkState();
  if (isConnected !== false && isInternetReachable !== false) return null;
  return <Text style={styles.bar}>No internet connection</Text>;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.error, color: colors.white, textAlign: 'center', fontSize: 12.5, fontWeight: '700', paddingVertical: 6 },
});
