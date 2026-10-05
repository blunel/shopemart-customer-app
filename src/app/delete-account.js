import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { apiFetch } from '../api';
import { useAuth } from '../AuthContext';
import { Button, Card, Field, ErrorText } from '../ui';
import { confirmAction, notify } from '../dialog';
import { colors, spacing, typography } from '../theme';

/** The shopper closes their own account (Google Play asks for this inside the app). Needs the password; the server refuses while an order is still on its way. */
export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true); setError('');
    try {
      await apiFetch('/api/customer/delete-account', { method: 'POST', body: JSON.stringify({ password }) });
      await logout();
      notify('Account deleted', 'Your account and personal details have been deleted.', () => router.replace('/(tabs)'));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const submit = () => {
    if (!password) { setError('Type your password to continue.'); return; }
    confirmAction('Delete your account?', 'This cannot be undone. Your points are lost and you can no longer sign in.', 'Delete', run, true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Card style={{ backgroundColor: colors.errorTint, borderColor: '#F3B8C0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color={colors.error} />
            <Text style={{ fontWeight: '800', color: colors.error, fontSize: 16 }}>Delete my account</Text>
          </View>
          <Text style={[typography.body, { marginTop: spacing.sm }]}>We delete your name, phone number, email, saved addresses and saved cart straight away, and you can no longer sign in.</Text>
          <Text style={[typography.body, { marginTop: spacing.sm }]}>The record of your past orders stays, without your name, because the shop must keep its sales records. Your leftover points are lost.</Text>
          <Text style={[typography.body, { marginTop: spacing.sm }]}>Orders still on the way must be delivered or cancelled first.</Text>
        </Card>
        <View style={{ marginTop: spacing.xl }}>
          <Field label="Your password" value={password} onChangeText={setPassword} placeholder="Type your password" secureTextEntry autoCapitalize="none" />
        </View>
        <ErrorText>{error}</ErrorText>
        <Button label="Delete my account" variant="danger" onPress={submit} busy={busy} />
        <Button label="Keep my account" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
