import { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { authConfig, sendOtp } from '../api';
import { useAuth } from '../AuthContext';
import { Button, Field, ErrorText } from '../ui';
import { notify } from '../dialog';
import { colors, spacing, typography } from '../theme';

const PHONE_OK = /^01[3-9]\d{8}$/;

/** A new shopper's account. When the shop sends a code by SMS, it asks for it too. */
export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { authConfig().then((c) => setOtpRequired(!!c.phoneOtpRequired)).catch(() => {}); }, []);

  const sendCode = async () => {
    if (!PHONE_OK.test(phone.trim())) { setError('Enter a mobile number like 01712345678 first.'); return; }
    setBusy(true); setError('');
    try { await sendOtp(phone.trim()); setCodeSent(true); notify('Code sent', 'We sent a code to your phone by SMS.'); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const submit = async () => {
    if (name.trim().length < 2) { setError('Please enter your name.'); return; }
    if (!PHONE_OK.test(phone.trim())) { setError('Enter a mobile number like 01712345678.'); return; }
    if (password.length < 6) { setError('Choose a password of at least 6 characters.'); return; }
    if (otpRequired && !otp.trim()) { setError('Enter the code we sent you by SMS.'); return; }
    setBusy(true); setError('');
    try {
      await register({ name: name.trim(), phone: phone.trim(), password, email: email.trim() || undefined, otp: otpRequired ? otp.trim() : undefined });
      if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }} keyboardShouldPersistTaps="handled">
        <Text style={typography.h1}>Create your account</Text>
        <Text style={[typography.caption, { marginTop: 4, marginBottom: spacing.xl }]}>Keep your orders in one place and earn points on every order.</Text>
        <Field label="Full name *" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="Phone *" value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
        <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Password *" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry autoCapitalize="none" />
        {otpRequired ? (
          <View>
            <Field label="SMS code *" value={otp} onChangeText={setOtp} placeholder="The code we send you" keyboardType="number-pad" />
            <Button label={codeSent ? 'Send the code again' : 'Send me the code'} variant="outline" small onPress={sendCode} disabled={busy} style={{ marginTop: -4, marginBottom: spacing.md }} />
          </View>
        ) : null}
        <ErrorText>{error}</ErrorText>
        <Button label="Create account" onPress={submit} busy={busy} style={{ marginTop: spacing.sm }} />
        <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: spacing.xl }}>
          <Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '700' }}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
