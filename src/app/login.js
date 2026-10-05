import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Image, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Phone } from 'lucide-react-native';
import { useAuth } from '../AuthContext';
import { Button, ErrorText } from '../ui';
import { SITE_URL } from '../config';
import { colors, spacing, radius, typography, shadow } from '../theme';

/** Sign in, then back to wherever the shopper was (the cart, an order…), or the home screen. */
export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!phone.trim() || !password) { setError('Enter your phone number and password'); return; }
    setBusy(true); setError('');
    try {
      await login(phone.trim(), password);
      if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={typography.h1}>Welcome back</Text>
          <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>Sign in to see your orders and points</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.field}>
            <Phone size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
            <TextInput style={styles.input} placeholder="Phone (01XXXXXXXXX)" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" autoCapitalize="none" value={phone} onChangeText={setPhone} editable={!busy} />
          </View>
          <View style={styles.field}>
            <Lock size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.textMuted} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} editable={!busy} onSubmitEditing={submit} />
          </View>
          <ErrorText>{error}</ErrorText>
          <Button label="Sign in" onPress={submit} busy={busy} />
          <TouchableOpacity onPress={() => Linking.openURL(`${SITE_URL}/forgot-password`)} style={{ marginTop: spacing.md }}>
            <Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.replace('/register')} style={{ marginTop: spacing.xl }}>
          <Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '700' }}>New here? Create an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { width: 68, height: 68, borderRadius: radius.lg, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.textPrimary },
});
