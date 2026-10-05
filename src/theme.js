// ShopeMart's Rose Royale palette (the same as the website's back office), kept in one place so every screen looks like the same app.
export const colors = {
  primary: '#B9375E',
  primaryDark: '#8A2846',
  primaryTint: '#FFE9EE',
  deep: '#602437',
  pink: '#E05780',
  blush: '#FFCAD4',
  background: '#FDF6F7',
  card: '#FFFFFF',
  textPrimary: '#2A1F23',
  textSecondary: '#645F5A',
  textMuted: '#9A8F94',
  border: '#EFDDE2',
  success: '#1B7F55',
  successTint: '#DFF6EE',
  warning: '#B35A00',
  warningTint: '#FFF1E0',
  error: '#B42318',
  errorTint: '#FDE3E7',
  info: '#1F6FB2',
  infoTint: '#E4F0FA',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const typography = {
  h1: { fontSize: 24, fontWeight: '800', color: colors.deep },
  h2: { fontSize: 17, fontWeight: '700', color: colors.deep },
  body: { fontSize: 14.5, color: colors.textPrimary },
  caption: { fontSize: 12.5, color: colors.textSecondary },
  label: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
};

export const shadow = {
  card: { shadowColor: '#602437', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
};

export const headerOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.deep, fontWeight: '700', fontSize: 16.5 },
};

export const money = (n) => `৳${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
export const when = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};
