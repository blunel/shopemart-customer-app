import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow } from './theme';

/* The few building blocks every screen is made of, so the whole app looks and behaves the same. */

export function Card({ children, style, onPress }) {
  const body = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <TouchableOpacity activeOpacity={0.85} onPress={onPress}>{body}</TouchableOpacity> : body;
}

export function Button({ label, onPress, busy, disabled, variant = 'solid', style, small }) {
  const off = busy || disabled;
  const solid = variant === 'solid';
  const danger = variant === 'danger';
  return (
    <TouchableOpacity
      activeOpacity={0.85} onPress={onPress} disabled={off}
      style={[styles.btn, small && styles.btnSmall, solid && styles.btnSolid, variant === 'outline' && styles.btnOutline, danger && styles.btnDanger, off && { opacity: 0.55 }, style]}
    >
      {busy ? <ActivityIndicator color={solid ? colors.white : colors.primary} /> : <Text style={[styles.btnText, small && { fontSize: 13 }, solid && { color: colors.white }, variant === 'outline' && { color: colors.primary }, danger && { color: colors.error }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

export function Chip({ label, on, onPress, count }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && { color: colors.white }]}>{label}{count !== undefined && count !== null ? ` · ${count}` : ''}</Text>
    </TouchableOpacity>
  );
}

/** A status pill: tone = success | warning | error | info | muted. */
export function Pill({ label, tone = 'muted' }) {
  const map = {
    success: [colors.successTint, colors.success], warning: [colors.warningTint, colors.warning], error: [colors.errorTint, colors.error],
    info: [colors.infoTint, colors.info], muted: ['#F3EEF0', colors.textSecondary], brand: [colors.primaryTint, colors.primary],
  };
  const [bg, fg] = map[tone] || map.muted;
  return <View style={[styles.pill, { backgroundColor: bg }]}><Text style={[styles.pillText, { color: fg }]}>{label}</Text></View>;
}

export function Field({ label, style, ...props }) {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label ? <Text style={[typography.label, { marginBottom: 5 }]}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.multiline && { height: 78, textAlignVertical: 'top', paddingTop: 11 }]} />
    </View>
  );
}

export function Stat({ label, value, sub, tone }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tone && { color: tone }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {sub ? <Text style={styles.statSub} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

export const ErrorText = ({ children }) => (children ? <Text style={styles.error}>{children}</Text> : null);

export function Empty({ title, sub }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl }}>
      <Text style={{ ...typography.h2, textAlign: 'center' }}>{title}</Text>
      {sub ? <Text style={{ ...typography.caption, textAlign: 'center', marginTop: 6 }}>{sub}</Text> : null}
    </View>
  );
}

export const Loading = () => <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

export function Section({ title, right, children }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={typography.h2}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  btn: { borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 9, paddingHorizontal: spacing.md },
  btnSolid: { backgroundColor: colors.primary },
  btnOutline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.card },
  btnDanger: { borderWidth: 1, borderColor: colors.error, backgroundColor: colors.errorTint },
  btnText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  pillText: { fontSize: 11.5, fontWeight: '700' },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: 15, color: colors.textPrimary },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, minWidth: 0 },
  statLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  statValue: { fontSize: 21, fontWeight: '800', color: colors.deep, marginTop: 4 },
  statSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 3 },
  error: { color: colors.error, fontSize: 13, marginVertical: spacing.sm, textAlign: 'center' },
});
