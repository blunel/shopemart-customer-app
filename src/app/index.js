import { Redirect } from 'expo-router';

/** The first route: straight into the shop. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
