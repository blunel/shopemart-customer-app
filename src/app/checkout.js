import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { checkoutOptions, quote as fetchQuote, placeOrder, myPoints } from '../api';
import { useAuth } from '../AuthContext';
import { useShop } from '../ShopContext';
import { Card, Button, Chip, Field, Section, ErrorText, Loading } from '../ui';
import { colors, spacing, radius, typography, money } from '../theme';

const METHOD_LABEL = { COD: 'Cash on delivery', BKASH: 'bKash', NAGAD: 'Nagad', ROCKET: 'Rocket' };
const isMobile = (m) => m === 'BKASH' || m === 'NAGAD' || m === 'ROCKET';
const PHONE_OK = /^01[3-9]\d{8}$/;
const EMAIL_OK = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// 01712345678, also typed as +8801712-345678 or 880 1712 345678
function cleanPhone(raw) {
  let d = String(raw || '').replace(/[\s\-().]/g, '');
  if (d.startsWith('+88')) d = d.slice(3);
  else if (d.startsWith('88') && d.length === 13) d = d.slice(2);
  return d;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, clear } = useShop();
  const [opts, setOpts] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [method, setMethod] = useState('COD');
  const [trx, setTrx] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [note, setNote] = useState('');
  const [q, setQ] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [points, setPoints] = useState(null); // the signed-in shopper's points, when the shop has them switched on
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => { checkoutOptions().then(setOpts).catch((e) => setError(e.message)); }, []);
  useEffect(() => { if (user) myPoints().then((d) => setPoints(d.points)).catch(() => {}); }, [user]);
  useEffect(() => { if (user?.phone && !phone) setPhone(user.phone); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const byZone = opts?.delivery?.mode === 'ZONES';
  const lines = useMemo(() => items.map((i) => ({ productId: i.productId, qty: i.qty, color: i.color || undefined, size: i.size || undefined })), [items]);

  // what the basket comes to is always asked of the server: it prices the goods, the coupon and the delivery
  useEffect(() => {
    if (items.length === 0 || done) return undefined;
    let alive = true;
    const t = setTimeout(() => {
      fetchQuote({ items: lines, zone: zone || undefined, couponCode: coupon || undefined, paymentMethod: method, pointsToUse: pointsToUse > 0 ? pointsToUse : undefined })
        .then((d) => { if (alive) { setQ(d.quote); setQuoteError(''); setCouponError(''); } })
        .catch((e) => {
          if (!alive) return;
          if (coupon) { setCouponError(e.message); setCoupon(''); } else { setQuoteError(e.message); }
        });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [lines, zone, coupon, method, pointsToUse, items.length, done]);

  if (done) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.xl, alignItems: 'center' }}>
        <CheckCircle2 size={64} color={colors.success} style={{ marginTop: spacing.xl }} />
        <Text style={[typography.h1, { marginTop: spacing.md }]}>Order placed!</Text>
        <Text style={[typography.body, { marginTop: spacing.sm }]}>Order no: <Text style={{ fontWeight: '800' }}>{done.orderNo}</Text></Text>
        <Text style={[typography.body, { marginTop: 2 }]}>Total: <Text style={{ fontWeight: '800' }}>{money(done.totalAmount)}</Text></Text>
        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md }]}>We will call you on your phone number to confirm delivery.</Text>
        {!user ? <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md }]}>Note your order number. To see your orders in the app later, create an account with this phone number.</Text> : null}
        <View style={{ width: '100%', marginTop: spacing.xl, gap: spacing.sm }}>
          {user ? <Button label="View my order" onPress={() => router.replace({ pathname: '/order/[id]', params: { id: done.id } })} /> : <Button label="Create an account" onPress={() => router.replace('/register')} />}
          <Button label="Continue shopping" variant="outline" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScrollView>
    );
  }

  if (items.length === 0) return <View style={styles.screen}><Text style={[typography.caption, { textAlign: 'center', margin: spacing.xl }]}>Your cart is empty.</Text></View>;
  if (!opts && !error) return <View style={styles.screen}><Loading /></View>;
  const guestBlocked = opts && !user && !opts.guestCheckout;
  const payments = (opts?.payments || []).filter((p) => p && METHOD_LABEL[p.method]);
  const methods = payments.length ? payments : [{ method: 'COD', label: METHOD_LABEL.COD, note: '' }];
  const chosen = methods.find((m) => m.method === method) || methods[0];

  const validate = () => {
    if (name.trim().length < 2) return 'Please enter your full name.';
    if (!PHONE_OK.test(cleanPhone(phone))) return 'Please enter a mobile number like 01712345678.';
    if (email.trim() && !EMAIL_OK.test(email.trim())) return 'Please enter a valid email address, or leave it empty.';
    if (address.trim().length < 5) return 'Please enter your full address (house, road, area).';
    if (byZone && !zone) return 'Please choose your delivery area.';
    if (isMobile(method)) {
      const t = trx.replace(/\s+/g, '');
      if (!t) return 'Please enter the transaction number (TrxID) from your payment.';
      if (!/^[A-Za-z0-9]{6,30}$/.test(t)) return 'The transaction number is letters and digits only, 6 to 30 of them.';
    }
    return '';
  };

  const submit = async () => {
    const bad = validate();
    if (bad) { setError(bad); return; }
    setBusy(true); setError('');
    try {
      const d = await placeOrder({
        items: lines,
        paymentMethod: method,
        paymentRef: isMobile(method) ? trx.replace(/\s+/g, '') : undefined,
        zone: (byZone && zone) || undefined,
        couponCode: (q && q.couponCode) || undefined, // only a code the server has already accepted in the quote
        pointsToUse: (q && Number(q.pointsUsed) > 0) ? Number(q.pointsUsed) : undefined, // likewise only points the quote accepted
        email: email.trim() || undefined,
        address: { line1: address.trim(), city: (byZone && zone) || 'Bangladesh', phone: cleanPhone(phone), label: name.trim().slice(0, 60) },
        note: note.trim() || undefined,
      }, !!user);
      clear();
      setDone({ ...d.order, totalAmount: d.order.totalAmount ?? q?.total });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
        {guestBlocked ? (
          <Card style={{ backgroundColor: colors.warningTint, borderColor: '#F5D9A8' }}>
            <Text style={{ color: colors.warning, fontWeight: '700' }}>Please sign in to place an order</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Button label="Sign in" small style={{ flex: 1 }} onPress={() => router.push('/login')} />
              <Button label="Create account" variant="outline" small style={{ flex: 1 }} onPress={() => router.push('/register')} />
            </View>
          </Card>
        ) : null}

        <Section title="Delivery details">
          <Field label="Full name *" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" />
          <Field label="Phone *" value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" keyboardType="phone-pad" />
          <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Address *" value={address} onChangeText={setAddress} placeholder="House, road, area" multiline />
          {byZone ? (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[typography.label, { marginBottom: 6 }]}>Delivery area *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {opts.delivery.zones.map((z) => <Chip key={z.name} label={z.name} on={zone === z.name} onPress={() => setZone(z.name)} />)}
              </View>
            </View>
          ) : null}
          {opts?.delivery?.eta ? <Text style={typography.caption}>Delivery: {opts.delivery.eta}</Text> : null}
        </Section>

        <Section title="Payment">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {methods.map((m) => <Chip key={m.method} label={m.label || METHOD_LABEL[m.method]} on={method === m.method} onPress={() => setMethod(m.method)} />)}
          </View>
          {chosen.note ? <Text style={[typography.caption, { marginTop: 4 }]}>{chosen.note}</Text> : null}
          {isMobile(method) ? <Field label="Transaction number (TrxID) *" value={trx} onChangeText={setTrx} placeholder="From your payment message" autoCapitalize="characters" style={{ marginTop: spacing.md }} /> : null}
        </Section>

        <Section title="Coupon">
          {q?.couponCode ? (
            <View style={styles.couponOn}>
              <Text style={{ color: colors.success, fontWeight: '700', flex: 1 }}>{q.couponCode} applied · −{money(q.couponDiscount)}</Text>
              <TouchableOpacity onPress={() => { setCoupon(''); setCouponInput(''); }}><Text style={{ color: colors.error, fontWeight: '700' }}>Remove</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput style={styles.coupon} placeholder="Coupon code" placeholderTextColor={colors.textMuted} value={couponInput} onChangeText={setCouponInput} autoCapitalize="characters" />
              <Button label="Apply" variant="outline" small onPress={() => { if (couponInput.trim()) { setCouponError(''); setCoupon(couponInput.trim()); } }} />
            </View>
          )}
          <ErrorText>{couponError}</ErrorText>
        </Section>

        {points && points.enabled && points.balance > 0 ? (
          <Section title="Points">
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Use my points</Text>
                <Text style={typography.caption}>You have {points.balance.toLocaleString('en-IN')} points{q && Number(q.pointsUsed) > 0 ? `. Using ${q.pointsUsed} saves ${money(q.pointsValue)}.` : '.'}</Text>
              </View>
              <Switch value={usePoints} trackColor={{ true: colors.primary }} onValueChange={(on) => {
                setUsePoints(on);
                if (!on) { setPointsToUse(0); return; }
                const rules = points.rules; const per = Number(rules?.pointValue) || 0;
                const room = q ? (Math.max(0, Number(q.subtotal) - Number(q.couponDiscount || 0)) * (Number(rules.maxRedeemPercent) || 0)) / 100 : 0;
                setPointsToUse(per > 0 ? Math.max(0, Math.min(points.balance, Math.floor((room + 0.004) / per + 1e-9))) : 0);
              }} />
            </Card>
          </Section>
        ) : null}

        <Section title="Note">
          <Field value={note} onChangeText={setNote} placeholder="Anything we should know (optional)" multiline />
        </Section>

        <Section title="Order summary">
          <Card>
            {(q?.lines || []).map((l, i) => (
              <View key={`${l.productId}-${i}`} style={styles.sumRow}>
                <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 13.5 }} numberOfLines={2}>{l.qty} × {l.name}{l.color || l.size ? ` (${[l.color, l.size].filter(Boolean).join(', ')})` : ''}</Text>
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{money(l.lineTotal)}</Text>
              </View>
            ))}
            {!q && !quoteError ? <Loading /> : null}
            {q ? (
              <>
                <View style={[styles.sumRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm }]}><Text style={typography.body}>Subtotal</Text><Text style={typography.body}>{money(q.subtotal)}</Text></View>
                {Math.max(0, Number(q.discount) - Number(q.couponDiscount || 0) - Number(q.pointsValue || 0)) > 0 ? <View style={styles.sumRow}><Text style={{ color: colors.success }}>Offer discount</Text><Text style={{ color: colors.success }}>−{money(Number(q.discount) - Number(q.couponDiscount || 0) - Number(q.pointsValue || 0))}</Text></View> : null}
                {Number(q.couponDiscount) > 0 ? <View style={styles.sumRow}><Text style={{ color: colors.success }}>Coupon</Text><Text style={{ color: colors.success }}>−{money(q.couponDiscount)}</Text></View> : null}
                {Number(q.pointsUsed) > 0 ? <View style={styles.sumRow}><Text style={{ color: colors.success }}>Points ({q.pointsUsed})</Text><Text style={{ color: colors.success }}>−{money(q.pointsValue)}</Text></View> : null}
                <View style={styles.sumRow}><Text style={typography.body}>Delivery</Text><Text style={typography.body}>{q.deliveryFee === null ? 'Choose your area' : Number(q.deliveryFee) > 0 ? money(q.deliveryFee) : 'Free'}</Text></View>
                <View style={[styles.sumRow, { marginTop: 4 }]}><Text style={{ fontWeight: '800', color: colors.deep, fontSize: 17 }}>Total</Text><Text style={{ fontWeight: '800', color: colors.deep, fontSize: 17 }}>{q.total === null ? '—' : money(q.total)}</Text></View>
              </>
            ) : null}
          </Card>
          <ErrorText>{quoteError}</ErrorText>
        </Section>

        <ErrorText>{error}</ErrorText>
        <Button label={isMobile(method) ? 'Place order' : 'Place order · Pay on delivery'} onPress={submit} busy={busy} disabled={guestBlocked || !!quoteError} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  coupon: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 15, color: colors.textPrimary },
  couponOn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successTint, borderRadius: radius.md, padding: spacing.md },
});
